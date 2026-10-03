"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, MessageSquare, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "hero", label: "Acasă", icon: Home, route: "/dashboard" },
  { id: "cursuri", label: "Cursuri", icon: BookOpen, route: "/courses" },
  { id: "interviu", label: "Interviu", icon: MessageSquare, route: "/interview" },
  { id: "clasament", label: "Clasament", icon: BarChart3, route: "/leaderboard" },
  { id: "profil", label: "Profil", icon: User, route: "/profile" },
] as const;

function shouldHideBottomNav(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "courses" && segments.length >= 3) return true;
  if (pathname.startsWith("/onboarding")) return true;
  if (pathname.startsWith("/admin")) return true;
  return false;
}

function getActiveByRoute(pathname: string): string {
  if (pathname === "/dashboard") return "hero";
  if (pathname.startsWith("/courses")) return "cursuri";
  if (pathname.startsWith("/interview")) return "interviu";
  if (pathname.startsWith("/leaderboard")) return "clasament";
  if (pathname.startsWith("/profile") || pathname.startsWith("/settings")) return "profil";
  return "hero";
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("hero");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isDashboard = pathname === "/dashboard";

  // IntersectionObserver for dashboard scroll tracking
  useEffect(() => {
    if (!isDashboard) return;

    // Observe all 10 sections — nav dot lights up for the closest nav-button section
    const sectionIds = [
      "hero", "prezentare", "cursuri", "realizari", "roadmap",
      "interviu", "comunitate", "clasament", "portofoliu", "profil",
    ];
    const visibleSections = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        let bestId = "hero";
        let bestRatio = 0;
        visibleSections.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        setActiveSection(bestId);
      },
      { threshold: [0, 0.3, 0.6, 1] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isDashboard]);

  useEffect(() => {
    if (!isDashboard) {
      setActiveSection(getActiveByRoute(pathname));
    }
  }, [isDashboard, pathname]);

  const handleClick = useCallback(
    (item: (typeof NAV_ITEMS)[number]) => {
      if (isDashboard) {
        const el = document.getElementById(item.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", `/dashboard#${item.id}`);
          setActiveSection(item.id);
        }
      } else {
        router.push(`/dashboard#${item.id}`);
      }
    },
    [isDashboard, router]
  );

  if (shouldHideBottomNav(pathname)) return null;

  return (
    <>
    {/* Phones only: reserve the space the floating nav covers, so the last content of a
        page can always be scrolled above it (the nav is hidden on lesson pages → no spacer). */}
    <div aria-hidden="true" className="h-20 sm:hidden" />
    <nav
      aria-label="Navigare principală"
      className="fixed z-50 h-[48px] max-sm:!w-[calc(100vw-24px)] max-sm:!bottom-[calc(1rem+env(safe-area-inset-bottom))] rounded-full border border-aurora-border-medium bg-aurora-bg-deepest/90 backdrop-blur-xl shadow-[0_0_30px_rgba(108,92,231,0.15)]"
      style={{ bottom: "1rem", left: "50%", transform: "translateX(-50%)", width: "min(480px, 75vw)" }}
    >
      <div className="flex h-full items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-px px-3 py-1 rounded-xl transition-colors min-w-[52px]",
                isActive
                  ? "text-aurora-primary-300"
                  : "text-aurora-text-tertiary"
              )}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-aurora-primary-500 shadow-[0_0_6px_2px_rgba(108,92,231,0.5)]" />
              )}
              <Icon className="h-[18px] w-[18px]" />
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
}
