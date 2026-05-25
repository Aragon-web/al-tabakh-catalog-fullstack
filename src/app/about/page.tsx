import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { AboutClient } from "./about-client"
import { fetchProducts, fetchCategories } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Malek Al-Tabakh Company — our story, mission, and values since 1999. Iraq's trusted food supply partner.",
  openGraph: { title: "About Us | Al-Tabakh", description: "Learn about Malek Al-Tabakh Company — our story, mission, and values since 1999." },
}

export default async function AboutPage() {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  return (
    <StoreProvider products={products} categories={categories}>
      <AboutClient />
    </StoreProvider>
  )
}
