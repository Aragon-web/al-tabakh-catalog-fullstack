import type { Metadata } from "next"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import { StoreProvider } from "@/lib/store"
import { ProductClient } from "./client-page"
import type { Product, Category } from "@/lib/types"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const products = await fetchProducts()
  const product = products.find(p => p.id === id)
  if (!product) return { title: "Product Not Found" }
  return {
    title: product.name_en,
    description: product.desc_en || `${product.name_en} - ${product.weight || ""} - Al-Tabakh premium food catalog`,
    openGraph: {
      title: `${product.name_en} | Al-Tabakh`,
      description: product.desc_en || `${product.name_en} - ${product.weight || ""}`,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [allProducts, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  const product = allProducts.find(p => p.id === id)
  if (!product) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_en,
    description: product.desc_en || `${product.name_en} - ${product.weight || ""}`,
    image: product.image_url || `${baseUrl}/placeholder-product.svg`,
    sku: product.id,
    category: categories.find(c => c.id === product.category_id)?.name_en || "",
    url: `${baseUrl}/product/${id}`,
  }

  return (
    <StoreProvider products={allProducts as Product[]} categories={categories as Category[]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <ProductClient productId={id} />
    </StoreProvider>
  )
}
