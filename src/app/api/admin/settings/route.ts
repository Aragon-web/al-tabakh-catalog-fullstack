import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("site_settings").select("*").order("key")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 })
    const client = getAdminClient()
    const { data, error } = await client.from("site_settings").upsert({ key, value }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }
}