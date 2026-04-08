"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
    >
      <LogOut className="h-4 w-4" />
      Deconectare
    </button>
  );
}
