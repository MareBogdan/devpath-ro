"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { postComment, upvoteComment } from "@/app/(dashboard)/courses/actions";
import { MessageSquare, ThumbsUp, CornerDownRight, Send, Lock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentRow {
  id: string;
  content: string;
  user_id: string;
  parent_id: string | null;
  upvote_count: number;
  created_at: string;
  users: { name: string | null; avatar_url: string | null } | null;
}

interface ThreadedComment extends CommentRow {
  replies: CommentRow[];
}

interface LessonCommentsProps {
  lessonId: string;
  userLevel: number;
  userId: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function UserAvatar({
  name,
  avatarUrl,
  size = 7,
}: {
  name: string | null;
  avatarUrl: string | null;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ? `${name}'s avatar` : ""}
          width={32}
          height={32}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Single comment card ──────────────────────────────────────────────────────

function CommentCard({
  comment,
  isReply = false,
  userId,
  userLevel,
  onReply,
  onUpvote,
  localUpvoted,
}: {
  comment: CommentRow;
  isReply?: boolean;
  userId: string | null;
  userLevel: number;
  onReply: (id: string, author: string) => void;
  onUpvote: (id: string) => void;
  localUpvoted: boolean;
}) {
  const authorName = comment.users?.name ?? "Student";

  return (
    <div className={`flex gap-3 ${isReply ? "ml-8 mt-3" : ""}`}>
      <UserAvatar name={authorName} avatarUrl={comment.users?.avatar_url ?? null} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{authorName}</span>
          <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <div className="flex items-center gap-3 mt-2">
          {/* Upvote */}
          <button
            onClick={() => onUpvote(comment.id)}
            disabled={localUpvoted || comment.user_id === userId}
            aria-label="Apreciază comentariul"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{comment.upvote_count}</span>
          </button>

          {/* Reply (Level 3+ only, not on nested replies) */}
          {!isReply && userId && userLevel >= 3 && (
            <button
              onClick={() => onReply(comment.id, authorName)}
              aria-label="Răspunde"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CornerDownRight className="h-3 w-3" />
              Răspunde
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reply form ───────────────────────────────────────────────────────────────

function ReplyForm({
  authorName,
  replyContent,
  setReplyContent,
  onSubmit,
  onCancel,
  posting,
}: {
  authorName: string;
  replyContent: string;
  setReplyContent: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  posting: boolean;
}) {
  return (
    <div className="ml-8 mt-2 p-3 rounded-lg bg-muted/30 border border-border">
      <p className="text-xs text-muted-foreground mb-2">
        Răspuns pentru <span className="font-medium text-foreground">{authorName}</span>
      </p>
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Scrie un răspuns..."
        rows={2}
        maxLength={2000}
        autoFocus
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={onSubmit}
          disabled={!replyContent.trim() || posting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send className="h-3 w-3" />
          Trimite
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Anulează
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LessonComments({ lessonId, userLevel, userId }: LessonCommentsProps) {
  const [comments, setComments] = useState<ThreadedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track locally which comments the current user has upvoted (prevents double-click)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  const supabase = createSupabaseBrowserClient();

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("lesson_comments")
      .select(
        "id, content, user_id, parent_id, upvote_count, created_at, users(name, avatar_url)"
      )
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });

    const all = (data ?? []) as unknown as CommentRow[];
    const topLevel = all.filter((c) => c.parent_id === null);
    const threaded: ThreadedComment[] = topLevel.map((c) => ({
      ...c,
      replies: all.filter((r) => r.parent_id === c.id),
    }));

    setComments(threaded);
    setLoading(false);
  }, [lessonId, supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handlePost(parentId: string | null, content: string) {
    setPosting(true);
    setError(null);
    const result = await postComment({ lessonId, content, parentId });
    if (result.error) {
      setError(result.error);
    } else {
      if (parentId === null) {
        setNewComment("");
      } else {
        setReplyContent("");
        setReplyTo(null);
      }
      await fetchComments();
    }
    setPosting(false);
  }

  async function handleUpvote(commentId: string) {
    if (upvoted.has(commentId)) return;
    setUpvoted((prev) => new Set(Array.from(prev).concat(commentId)));
    await upvoteComment(commentId);
    await fetchComments();
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  if (!userId) return null;

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comentarii {totalCount > 0 ? `(${totalCount})` : ""}
      </h3>

      {/* Level gate */}
      {userLevel < 3 ? (
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3 mb-6">
          <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Comentariile se deblochează la Nivelul 3
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completează mai multe lecții pentru a ajunge la nivelul Învățăcel și a putea comenta.
            </p>
          </div>
        </div>
      ) : (
        /* New comment form */
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (newComment.trim()) await handlePost(null, newComment.trim());
          }}
          className="flex gap-3 mb-8"
        >
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Scrie un comentariu..."
              rows={2}
              maxLength={2000}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || posting}
            className="shrink-0 self-start inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Trimite
          </button>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Niciun comentariu încă. Fii primul!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentCard
                comment={comment}
                userId={userId}
                userLevel={userLevel}
                onReply={(id, author) => {
                  setReplyTo({ id, author });
                  setReplyContent("");
                }}
                onUpvote={handleUpvote}
                localUpvoted={upvoted.has(comment.id)}
              />

              {/* Reply form for this comment */}
              {replyTo?.id === comment.id && (
                <ReplyForm
                  authorName={replyTo.author}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmit={() => {
                    if (replyContent.trim()) handlePost(comment.id, replyContent.trim());
                  }}
                  onCancel={() => setReplyTo(null)}
                  posting={posting}
                />
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="space-y-3 mt-1">
                  {comment.replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      isReply
                      userId={userId}
                      userLevel={userLevel}
                      onReply={() => {}} // no nested replies
                      onUpvote={handleUpvote}
                      localUpvoted={upvoted.has(reply.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
