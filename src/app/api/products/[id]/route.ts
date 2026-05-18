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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const { id } = await params
    const { error } = await client.from("products").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
