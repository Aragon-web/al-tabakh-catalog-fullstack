import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import { SitemapClient } from "./sitemap-client"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Browse all categories and products in the Al-Tabakh catalog — complete site navigation.",
  openGraph: { title: "Sitemap | Al-Tabakh", description: "Browse all categories and products in the Al-Tabakh catalog." },
}

export default async function SitemapPage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  return (
    <StoreProvider products={products as Product[]} categories={categories as Category[]}>
      <SitemapClient />
    </StoreProvider>
  )
}
