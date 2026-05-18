import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url === "your_supabase_url") {
      throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

function getAdminClient(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key || url === "your_supabase_url") {
      throw new Error("Supabase service role not configured")
    }
    _supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  }
  return _supabaseAdmin
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) { return getClient()[prop as keyof SupabaseClient] }
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) { return getAdminClient()[prop as keyof SupabaseClient] }
})
