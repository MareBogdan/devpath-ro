import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Module-level singleton for Realtime use.
// Prevents React 18 Strict Mode's double-mount from creating two separate
// WebSocket connections and then disconnecting on the first cleanup.
let _realtimeClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    // SSR: return a per-request client (Realtime is never used server-side)
    return createSupabaseBrowserClient();
  }
  if (!_realtimeClient) {
    _realtimeClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _realtimeClient;
}
