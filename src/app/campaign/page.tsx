import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { CampaignClient } from "./campaign-client"
import { fetchProducts, fetchCategories } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Special Offers",
  description: "Discounted products and special offers from Al-Tabakh — limited-time deals on premium food products.",
  openGraph: { title: "Special Offers | Al-Tabakh", description: "Discounted products available for a limited time." },
}

export default async function CampaignPage() {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  return (
    <StoreProvider products={products} categories={categories}>
      <CampaignClient />
    </StoreProvider>
  )
}