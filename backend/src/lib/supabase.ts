import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { env } from "../config/env";

/**
 * Admin client — bypasses RLS. Use only on the server.
 * Never import this module from the mobile app.
 */
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws as any,
  },
});
