import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { slugify } from "@/lib/slugify"
import { logAdminAction } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const client = getAdminClient()
    if (slug) {
      const { data, error } = await client.from("recipes").select("*").eq("slug", slug).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json(data)
    }
    const { data, error } = await client.from("recipes").select("*").order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const body = await req.json()
    const { title_en, title_ar, excerpt_en, excerpt_ar, content_en, content_ar, image_url, author, published } = body
    if (!title_en || !title_ar) {
      return NextResponse.json({ error: "Title in both languages is required" }, { status: 400 })
    }
    const slug = slugify(title_en)
    const client = getAdminClient()
    const { data, error } = await client.from("recipes").insert({
      title_en, title_ar, slug, excerpt_en: excerpt_en || "", excerpt_ar: excerpt_ar || "",
      content_en: content_en || "", content_ar: content_ar || "",
      image_url: image_url || "", author: author || "", published: published || false,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    logAdminAction("create", "recipe", data?.slug || "", { title_en })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
