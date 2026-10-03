"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Changing this value (e.g. the lesson id) clears a previous error. */
  resetKey?: string;
}

interface State {
  hasError: boolean;
  resetKey?: string;
}

/**
 * Safety net around the compiled-MDX renderer. A custom MDX component (or a
 * malformed lesson) that throws while rendering must not take the whole lesson
 * page down: the learner keeps the header, comments, navigation and — because the
 * completion controls live outside this boundary — the Complete button.
 */
export class LessonErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[LessonContent] render failed:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="my-8 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-2">
          <p className="font-medium">Nu am putut afișa conținutul acestei lecții.</p>
          <p className="text-amber-700/90 dark:text-amber-300/80">
            A apărut o problemă la afișare. Poți reîncărca pagina sau continua cu
            lecția următoare.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border border-amber-400/60 px-3 py-1 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }
}
