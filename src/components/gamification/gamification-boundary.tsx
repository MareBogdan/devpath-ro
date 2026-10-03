"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Wraps purely-decorative gamification UI (celebration overlay, XP / streak / badge
 * toasts, confetti). If any of it throws while rendering, it is dropped silently and
 * the page — including the lesson content and Complete button — keeps working.
 */
export class GamificationBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[gamification] celebration UI failed and was skipped:", error, info.componentStack);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Fire confetti without ever throwing (e.g. no canvas / blocked by the browser). */
export function safeConfetti(fire: () => void) {
  try {
    fire();
  } catch (err) {
    console.warn("[gamification] confetti skipped:", err);
  }
}
