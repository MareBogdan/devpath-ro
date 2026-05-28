"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Pencil,
  ChevronDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Clock,
  Zap,
  Hourglass,
  User as UserIcon,
} from "lucide-react";
import { CategoryPillGroup } from "@/components/ui/category-pill";
import { updateProfile } from "@/app/(dashboard)/profile/actions";

interface ProfileEditCardProps {
  initialName: string;
  initialAvatarUrl: string | null;
  initialDailyGoal: 0 | 5 | 15 | 30;
}

const DAILY_GOAL_OPTIONS = [
  { value: "5", label: "5 min", icon: Coffee, color: "#00CEC9" },
  { value: "15", label: "15 min", icon: Clock, color: "#6C5CE7" },
  { value: "30", label: "30 min", icon: Zap, color: "#FDCB6E" },
  { value: "0", label: "Flexibil", icon: Hourglass, color: "#888888" },
];

export function ProfileEditCard({
  initialName,
  initialAvatarUrl,
  initialDailyGoal,
}: ProfileEditCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [dailyGoal, setDailyGoal] = useState<0 | 5 | 15 | 30>(initialDailyGoal);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim().length > 0 ? avatarUrl.trim() : null,
        dailyGoalMinutes: dailyGoal,
      });
      if (result.success) {
        setFeedback({ kind: "success", message: "Profil salvat!" });
        setTimeout(() => setFeedback(null), 3000);
        router.refresh();
      } else {
        setFeedback({
          kind: "error",
          message: result.error ?? "Eroare la salvare.",
        });
      }
    });
  }

  const showAvatarPreview = avatarUrl.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-primary-500/10 shrink-0">
            <Pencil className="h-4 w-4 text-aurora-primary-500" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Editează profilul
            </p>
            <p className="text-xs text-muted-foreground">
              Nume, avatar, obiectiv zilnic
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="px-5 py-5 border-t border-border space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider"
                >
                  Nume
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={1}
                  maxLength={80}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-aurora-primary-500/40 focus:border-aurora-primary-500 transition"
                />
              </div>

              {/* Avatar URL + preview */}
              <div>
                <label
                  htmlFor="profile-avatar"
                  className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider"
                >
                  URL Avatar (opțional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    {showAvatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image
                        src={avatarUrl}
                        alt="Preview"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={() => setFeedback({ kind: "error", message: "Imagine nevalidă." })}
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    id="profile-avatar"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    maxLength={500}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-aurora-primary-500/40 focus:border-aurora-primary-500 transition"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Lipește un link către o imagine (ex: avatar GitHub).
                </p>
              </div>

              {/* Daily goal */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Obiectiv zilnic
                </label>
                <CategoryPillGroup
                  options={DAILY_GOAL_OPTIONS}
                  value={String(dailyGoal)}
                  onChange={(v) => setDailyGoal(Number(v) as 0 | 5 | 15 | 30)}
                  groupId="profile-daily-goal"
                  className="flex-wrap"
                />
              </div>

              {/* Feedback message */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      feedback.kind === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : "border-red-500/30 bg-red-500/10 text-red-500"
                    }`}
                  >
                    {feedback.kind === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save button */}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-xl bg-aurora-primary-500 hover:bg-aurora-primary-600 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                <Save className="h-4 w-4" />
                {pending ? "Se salvează..." : "Salvează"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
