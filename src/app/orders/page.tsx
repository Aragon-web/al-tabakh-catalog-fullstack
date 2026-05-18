import { supabaseServer } from "@/lib/supabase-server"
import { StoreProvider } from "@/lib/store"
import { OrdersClient } from "./orders-client"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await supabaseServer.from("products").select("*").order("created_at", { ascending: false })
    return (data as Product[]) || []
  } catch { return [] }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await supabaseServer.from("categories").select("*").order("sort_order", { ascending: true })
    return (data as Category[]) || []
  } catch { return [] }
}

export default async function OrdersPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <StoreProvider products={products} categories={categories}>
      <OrdersClient />
    </StoreProvider>
  )
}
