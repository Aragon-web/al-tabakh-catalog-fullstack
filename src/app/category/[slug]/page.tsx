import type { Metadata } from "next"
import { fetchProducts, fetchCategories } from "@/lib/supabase"
import { StoreProvider } from "@/lib/store"
import { CategoryClient } from "./client-page"
import type { Product, Category } from "@/lib/types"
import { notFound } from "next/navigation"
import { slugify } from "@/lib/slugify"

function findCategory(categories: Category[], slug: string): Category | undefined {
  return categories.find(c => c.id === slug) || categories.find(c => slugify(c.name_en) === slug)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const categories = await fetchCategories()
  const category = findCategory(categories, slug)
  if (!category) return { title: "Category Not Found" }
  return {
    title: category.name_en,
    description: `Browse ${category.name_en} products - Al-Tabakh premium food catalog`,
    openGraph: {
      title: `${category.name_en} | Al-Tabakh`,
      description: `Browse ${category.name_en} products from Al-Tabakh`,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [allProducts, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ])

  const category = findCategory(categories, slug)
  if (!category) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: category.name_en, item: `${baseUrl}/category/${slug}` },
    ],
  }
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name_en,
    description: `Browse ${category.name_en} products from Al-Tabakh`,
    url: `${baseUrl}/category/${slug}`,
    numberOfItems: allProducts.filter(p => p.category_id === category.id).length,
  }

  return (
    <StoreProvider products={allProducts as Product[]} categories={categories as Category[]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }} />
      <CategoryClient slug={slug} />
    </StoreProvider>
  )
}
