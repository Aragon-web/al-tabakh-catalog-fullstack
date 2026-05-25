import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { slugify } from "@/lib/slugify"
import { logAdminAction } from "@/lib/audit"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  const { id } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}
  const fields = ["title_en", "title_ar", "excerpt_en", "excerpt_ar", "content_en", "content_ar", "image_url", "author", "published"]
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f]
  }
  if (body.title_en) updates.slug = slugify(body.title_en)

  const client = getAdminClient()
  const { data, error } = await client.from("recipes").update(updates).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  logAdminAction("update", "recipe", id, { changes: Object.keys(updates) })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  const { id } = await params
  const client = getAdminClient()
  const { error } = await client.from("recipes").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  logAdminAction("delete", "recipe", id, {})
  return NextResponse.json({ success: true })
}
