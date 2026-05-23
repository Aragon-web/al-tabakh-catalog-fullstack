import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { categorySlug } from "@/lib/slugify"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) return []

  const client = createClient(supabaseUrl, supabaseKey)

  const [productsRes, categoriesRes] = await Promise.all([
    client.from("products").select("id, category_id, updated_at"),
    client.from("categories").select("id, name_en, name_ar, updated_at"),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"

  const staticPages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/about", priority: 0.5, freq: "monthly" },
    { path: "/cart", priority: 0.3, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "monthly" },
    { path: "/faq", priority: 0.5, freq: "monthly" },
    { path: "/loyalty", priority: 0.4, freq: "monthly" },
    { path: "/orders", priority: 0.3, freq: "monthly" },
    { path: "/sitemap", priority: 0.3, freq: "monthly" },
    { path: "/account/login", priority: 0.2, freq: "monthly" },
    { path: "/account/register", priority: 0.2, freq: "monthly" },
    { path: "/campaign", priority: 0.4, freq: "weekly" },
    { path: "/locations", priority: 0.7, freq: "weekly" },
  ]

  const entries: MetadataRoute.Sitemap = staticPages.map(p => ({
    url: `${baseUrl}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.freq,
    priority: p.priority,
  }))

  const categories = categoriesRes.data || []
  for (const cat of categories) {
    if (cat.id === "all") continue
    entries.push({
      url: `${baseUrl}/category/${categorySlug(cat)}`,
      lastModified: new Date(cat.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  }

  const products = productsRes.data || []
  for (const product of products) {
    entries.push({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updated_at || Date.now()),
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  return entries
}
