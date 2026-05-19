import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const { id } = await params
    const body = await req.json()
    const { data, error } = await client.from("products").update(body).eq("id", id).select().single()
    if (error) {
      console.error("PUT /api/products error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error("PUT /api/products exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const { id } = await params
    const { error } = await client.from("products").delete().eq("id", id)
    if (error) {
      console.error("DELETE /api/products error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("DELETE /api/products exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
