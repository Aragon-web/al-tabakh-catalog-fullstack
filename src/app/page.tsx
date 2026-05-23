import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { ClientPage } from "./client-page"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import type { Product, Category } from "@/lib/types"

export const metadata: Metadata = {
  title: "Al-Tabakh Premium Catalog",
  description: "Browse 480+ premium food products from Malek Al-Tabakh Company — spices, baking supplies, sweets, and more. Wholesale food supplier since 1999.",
  openGraph: {
    title: "Al-Tabakh Premium Catalog",
    description: "Browse 480+ premium food products from Malek Al-Tabakh Company — spices, baking supplies, sweets, and more.",
  },
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Al-Tabakh Premium Catalog",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <StoreProvider products={products as Product[]} categories={categories as Category[]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <ClientPage />
    </StoreProvider>
  )
}
