"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      if (total <= 0) {
        setProgress(100);
        setHasReachedEnd(true);
        return;
      }
      const current = (scrollTop / total) * 100;
      const rounded = Math.min(100, Math.round(current));
      setProgress(rounded);
      if (current >= 90) {
        setHasReachedEnd(true); // never resets to false
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check on mount in case content is short
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { progress, hasReachedEnd };
}

interface ReadingProgressBarProps {
  accentColor?: string;
}

export function ReadingProgressBar({
  accentColor = "#6C5CE7",
}: ReadingProgressBarProps) {
  const { progress } = useReadingProgress();
  const springProgress = useSpring(progress, { stiffness: 200, damping: 30 });
  const scaleX = useTransform(springProgress, (v) => v / 100);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] h-[4px] origin-left"
      style={{
        scaleX,
        backgroundColor: accentColor,
        boxShadow: "0 0 8px 2px rgba(108,92,231,0.6)",
      }}
    />
  );
}
