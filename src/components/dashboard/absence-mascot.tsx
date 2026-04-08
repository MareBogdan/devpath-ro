"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PixelMascot } from "@/components/mascot/pixel-mascot";

const SESSION_KEY = "absence_mascot_dismissed";

interface AbsenceMascotProps {
  daysAbsent: number;
  lastLessonTitle: string | null;
  lastLessonHref: string | null;
}

export function AbsenceMascot({
  daysAbsent,
  lastLessonTitle,
  lastLessonHref,
}: AbsenceMascotProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (daysAbsent < 3) return;
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) setVisible(true);
  }, [daysAbsent]);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="rounded-2xl border border-blue-300/30 bg-blue-50/10 dark:border-blue-700/30 dark:bg-blue-950/20 px-5 py-4 flex items-center gap-4"
        >
          <PixelMascot emotion="sad" size={56} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Mi-a fost dor de tine!</p>
            {lastLessonTitle && lastLessonHref ? (
              <p className="text-sm text-muted-foreground mt-0.5">
                Ultima lecție:{" "}
                <Link
                  href={lastLessonHref}
                  className="text-primary font-medium hover:underline"
                >
                  {lastLessonTitle}
                </Link>
                {". "}
                Revii?
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5">Revii?</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {daysAbsent} {daysAbsent === 1 ? "zi" : "zile"} de absență
            </p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition"
            aria-label="Închide"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
