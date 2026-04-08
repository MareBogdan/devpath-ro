"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Map,
  Briefcase,
  MessageSquare,
  LogOut,
  Shield,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/search/command-palette";
import { signOut } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

interface NavUser {
  name: string | null;
  email: string;
  avatar_url: string | null;
  plan: "free" | "pro" | "lifetime";
  isAdmin?: boolean;
}

interface NavbarProps {
  user: NavUser;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Cursuri", icon: BookOpen },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/portfolio", label: "Portofoliu", icon: Briefcase },
  { href: "/interview", label: "Interviu", icon: MessageSquare },
];

const planLabels: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  lifetime: "Lifetime",
};

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

const planBadgeVariant: Record<string, "outline" | "default" | "success"> = {
  free: "outline",
  pro: "default",
  lifetime: "success",
};

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-6 gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0">
          <span className="text-xl font-bold text-foreground">
            Dev<span className="text-primary">Path</span>{" "}
            <span className="text-muted-foreground font-normal text-base">
              RO
            </span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Cmd+K search palette */}
          <CommandPalette />

          <ThemeToggle />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition-colors outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatar_url ?? undefined}
                  alt={user.name ?? user.email}
                />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {user.name ?? user.email.split("@")[0]}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge
                    variant={planBadgeVariant[user.plan] ?? "outline"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {planLabels[user.plan] ?? user.plan}
                  </Badge>
                  {user.isAdmin && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                      <Shield className="h-2.5 w-2.5" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
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
                <Link href="/settings/notifications" className="cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Setări notificări
                </Link>
              </DropdownMenuItem>
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
