import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _supabaseAdmin: SupabaseClient | null = null

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

// Helper functions that always use the admin client directly
export async function fetchProducts() {
  try {
    const client = getAdminClient()
    const { data } = await client.from("products").select("*").order("created_at", { ascending: false })
    return (data || []) as any[]
  } catch { return [] }
}

export async function fetchCategories() {
  try {
    const client = getAdminClient()
    const { data } = await client.from("categories").select("*").order("sort_order", { ascending: true })
    return (data || []) as any[]
  } catch { return [] }
}

export async function fetchOrders() {
  try {
    const client = getAdminClient()
    const { data } = await client.from("orders").select("*").order("created_at", { ascending: false }).limit(50)
    return (data || []) as any[]
  } catch { return [] }
}

export { getAdminClient }
