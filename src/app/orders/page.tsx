import { supabaseAdmin } from "@/lib/supabase"
import { StoreProvider } from "@/lib/store"
import { OrdersClient } from "./orders-client"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  let products: Product[] = []
  let categories: Category[] = []

  try {
    const [pRes, cRes] = await Promise.all([
      supabaseAdmin.from("products").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("categories").select("*").order("sort_order", { ascending: true }),
    ])
    if (pRes.data) products = pRes.data as Product[]
    if (cRes.data) categories = cRes.data as Category[]
  } catch {}

  return (
    <StoreProvider products={products} categories={categories}>
      <OrdersClient />
    </StoreProvider>
  )
}
