import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 number */}
        <div className="space-y-1">
          <p className="text-8xl font-bold text-aurora-primary-500/20 select-none">
            404
          </p>
          <div className="w-16 h-px bg-aurora-border-medium mx-auto" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-aurora-text-primary">
            Pagina nu a fost găsită
          </h1>
          <p className="text-sm text-aurora-text-tertiary leading-relaxed">
            Secțiunea pe care ai accesat-o nu există sau a fost mutată.
          </p>
        </div>

        {/* Action */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-aurora-primary-500 text-white text-sm font-medium hover:bg-aurora-primary-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Înapoi la Dashboard
        </Link>
      </div>
    </div>
  );
}
