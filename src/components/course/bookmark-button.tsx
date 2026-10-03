"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toggleBookmark } from "@/app/(dashboard)/courses/actions";

interface BookmarkButtonProps {
  lessonId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ lessonId, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setBookmarked((prev) => !prev); // optimistic
    startTransition(async () => {
      const result = await toggleBookmark(lessonId);
      if (result.error) {
        setBookmarked((prev) => !prev); // revert on error
      } else {
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isPending}
      whileTap={{ scale: 0.85 }}
      title={bookmarked ? "Elimină din favorite" : "Adaugă la favorite"}
      className="p-1.5 max-sm:p-2.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          bookmarked ? "fill-red-500 text-red-500" : ""
        }`}
      />
    </motion.button>
  );
}
