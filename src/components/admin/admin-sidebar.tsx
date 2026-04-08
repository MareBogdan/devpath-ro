"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Gamepad2,
  MessageSquare,
  Award,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Statistici", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Useri", icon: Users, exact: false },
  { href: "/admin/lessons", label: "Lecții", icon: BookOpen, exact: false },
  { href: "/admin/minigames", label: "Mini-jocuri", icon: Gamepad2, exact: false },
  { href: "/admin/comments", label: "Comentarii", icon: MessageSquare, exact: false },
  { href: "/admin/badges", label: "Badge-uri", icon: Award, exact: false },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-background flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">Admin</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">DevPath RO</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-amber-600 dark:text-amber-400" : ""
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Back to app */}
      <div className="p-3 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
        >
          ← Înapoi la platformă
        </Link>
      </div>
    </aside>
  );
}
