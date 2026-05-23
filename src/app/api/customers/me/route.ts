import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("customers").select("id, name, email, phone, points, created_at").eq("auth_token", token).maybeSingle()
    if (error || !data) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const client = getAdminClient()
    const updates: Record<string, unknown> = {}
    if (body.name) updates.name = body.name
    if (body.phone !== undefined) updates.phone = body.phone
    const { data, error } = await client.from("customers").update(updates).eq("auth_token", token).select("id, name, email, phone, points, created_at").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}