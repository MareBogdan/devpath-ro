"use client";

import { useEffect } from "react";

// Root-level boundary: catches crashes in the root layout itself (where no other
// error.tsx can help). It REPLACES the root layout, so it must render its own
// <html>/<body> — and it can't rely on Tailwind/theme CSS being applied, hence the
// inline Aurora-dark styles (same look as the app's error cards).
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#0a0a0f",
          color: "#ffffff",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          role="alert"
          style={{ maxWidth: 448, width: "100%", textAlign: "center" }}
        >
          {/* Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "rgba(108,92,231,0.1)",
              border: "1px solid rgba(108,92,231,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width={36}
              height={36}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6c5ce7"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Text */}
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>
            Ceva nu a funcționat corect
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#a0a0b0",
            }}
          >
            A apărut o eroare neașteptată în aplicație. Reîncarcă pagina pentru a
            continua.
          </p>
          {error.digest && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: "#666680",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              ID eroare: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            {/* A full reload, not reset(): the root layout itself failed, so
                re-rendering the same tree would just fail again. */}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                background: "#6c5ce7",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reîncarcă pagina
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: "1px solid #2a2a3d",
                color: "#a0a0b0",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Mergi acasă
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
