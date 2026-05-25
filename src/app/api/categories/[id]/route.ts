import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { logAdminAction } from "@/lib/audit"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const { id } = await params
    const body = await req.json()
    const { data, error } = await client.from("categories").update(body as Record<string, unknown>).eq("id", id).select().single()
    if (error) {
      console.error("PUT /api/categories error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    logAdminAction("update", "category", id, { changes: body })
    return NextResponse.json(data)
  } catch (e) {
    console.error("PUT /api/categories exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const { id } = await params
    await client.from("products").update({ category_id: "all" }).eq("category_id", id)
    const { error } = await client.from("categories").delete().eq("id", id)
    if (error) {
      console.error("DELETE /api/categories error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    logAdminAction("delete", "category", id, {})
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("DELETE /api/categories exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
