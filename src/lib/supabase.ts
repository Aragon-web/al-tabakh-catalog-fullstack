import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Product, Category } from "./types"

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

export async function fetchProducts(): Promise<Product[]> {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("products").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("fetchProducts error:", error.message)
      return []
    }
    return (data || []) as Product[]
  } catch (e) {
    console.error("fetchProducts exception:", e)
    return []
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("categories").select("*").order("sort_order", { ascending: true })
    if (error) {
      console.error("fetchCategories error:", error.message)
      return []
    }
    return (data || []) as Category[]
  } catch (e) {
    console.error("fetchCategories exception:", e)
    return []
  }
}

export async function fetchOrders() {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false }).limit(50)
    if (error) {
      console.error("fetchOrders error:", error.message)
      return []
    }
    return (data || [])
  } catch (e) {
    console.error("fetchOrders exception:", e)
    return []
  }
}

export { getAdminClient }
