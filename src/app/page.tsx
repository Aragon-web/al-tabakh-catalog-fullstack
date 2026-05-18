import { StoreProvider } from "@/lib/store"
import { ClientPage } from "./client-page"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  return (
    <StoreProvider products={products as Product[]} categories={categories as Category[]}>
      <ClientPage />
    </StoreProvider>
  )
}
