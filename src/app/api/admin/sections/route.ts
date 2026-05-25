import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { logAdminAction } from "@/lib/audit"

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("site_sections").select("*").order("key")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { key, visible } = await req.json()
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 })
    const client = getAdminClient()
    const { data, error } = await client.from("site_sections").update({ visible }).eq("key", key).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    logAdminAction("update_visibility", "section", key, { visible })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }
}