"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut, Shield, Settings, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/search/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";

interface NavUser {
  name: string | null;
  email: string;
  avatar_url: string | null;
  plan: "free" | "pro" | "lifetime";
  isAdmin?: boolean;
  xpPoints?: number;
}

interface NavbarProps {
  user: NavUser;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  return email[0].toUpperCase();
}

function getBackHref(pathname: string): string | null {
  if (pathname === "/dashboard") return null;
  if (pathname.startsWith("/courses/")) return "/dashboard#cursuri";
  return "/dashboard";
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const backHref = getBackHref(pathname);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-aurora-border-subtle bg-aurora-bg-deepest">
      <div className="flex h-full items-center px-6 gap-4">
        {/* Back arrow (sub-pages only) */}
        {backHref && (
          <Link
            href={backHref}
            className="shrink-0 p-1.5 -ml-1.5 max-sm:p-3 max-sm:-ml-3 rounded-lg text-aurora-text-tertiary hover:text-aurora-text-primary hover:bg-aurora-bg-interactive transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}

        {/* Logo */}
        <Link href="/dashboard" className="shrink-0 max-sm:py-2.5">
          <span className="text-xl font-medium tracking-tight">
            <span className="text-aurora-primary-300">DevPath</span>
            <span className="text-aurora-accent-500">.ro</span>
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side: XP badge + avatar */}
        <div className="flex items-center gap-3">
          {/* Invisible command palette (Cmd+K still works) */}
          <div className="hidden">
            <CommandPalette />
          </div>

          {/* XP badge */}
          {user.xpPoints !== undefined && (
            <span className="text-sm font-semibold text-aurora-gold-500 tabular-nums">
              {user.xpPoints.toLocaleString()} XP
            </span>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 hover:bg-aurora-bg-interactive transition-colors outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatar_url ?? undefined}
                  alt={user.name ?? user.email}
                />
                <AvatarFallback className="text-xs bg-aurora-primary-500 text-white">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    {user.name ?? user.email.split("@")[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserCircle className="h-4 w-4" />
                  Profilul meu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/notifications" className="cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Setări notificări
                </Link>
              </DropdownMenuItem>
              {user.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                Deconectare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
