import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import { LocationsClient } from "./locations-wrapper"
import type { Product, Category } from "@/lib/types"

export const metadata: Metadata = {
  title: "Our Locations | Al-Tabakh",
  description: "Find Al-Tabakh premium food product vendors across Iraq — interactive map with store locations in 17 cities.",
  openGraph: {
    title: "Our Locations | Al-Tabakh",
    description: "Find Al-Tabakh premium food product vendors across Iraq.",
  },
}

export default async function LocationsPage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  return (
    <StoreProvider products={products as Product[]} categories={categories as Category[]}>
      <LocationsClient />
    </StoreProvider>
  )
}
