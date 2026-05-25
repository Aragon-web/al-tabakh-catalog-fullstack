import { getAdminClient } from "@/lib/supabase"
import { StoreProvider } from "@/lib/store"
import { RecipeDetailClient } from "./client-page"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const client = getAdminClient()
  const { data: recipe } = await client.from("recipes").select("*").eq("slug", slug).single()
  if (!recipe) return { title: "Recipe Not Found" }
  return {
    title: recipe.title_en,
    description: recipe.excerpt_en || recipe.title_en,
    openGraph: {
      title: recipe.title_en,
      description: recipe.excerpt_en || recipe.title_en,
      images: recipe.image_url ? [{ url: recipe.image_url }] : [],
    },
  }
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const client = getAdminClient()
  const { data: recipe } = await client.from("recipes").select("*").eq("slug", slug).single()
  return (
    <StoreProvider products={[] as Product[]} categories={[] as Category[]}>
      <RecipeDetailClient recipe={recipe || null} />
    </StoreProvider>
  )
}
