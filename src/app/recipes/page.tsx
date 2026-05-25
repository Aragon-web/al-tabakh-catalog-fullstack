import { getAdminClient } from "@/lib/supabase"
import { StoreProvider } from "@/lib/store"
import { RecipesClient } from "./recipes-client"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Recipes & Blog",
  description: "Explore recipes, cooking tips, and stories from Al-Tabakh",
}

export default async function RecipesPage() {
  const client = getAdminClient()
  const { data: recipes } = await client.from("recipes").select("*").eq("published", true).order("created_at", { ascending: false })
  return (
    <StoreProvider products={[] as Product[]} categories={[] as Category[]}>
      <RecipesClient recipes={recipes || []} />
    </StoreProvider>
  )
}
