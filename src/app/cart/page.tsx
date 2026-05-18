import { StoreProvider } from "@/lib/store"
import { CartClient } from "./cart-client"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  return (
    <StoreProvider products={products as Product[]} categories={categories as Category[]}>
      <CartClient />
    </StoreProvider>
  )
}
