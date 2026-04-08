"use client";

import { ToastProvider } from "@/components/ui/toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
