import { createClient } from "@supabase/supabase-js";

// Server-only. Never import into a Client Component or expose to the browser.
// Used in Server Actions and API routes that need to bypass RLS.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — server-only context required");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
