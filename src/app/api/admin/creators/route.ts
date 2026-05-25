import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("creator_applications").select("*").order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { id, status } = await req.json()
    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "id and status (approved/rejected) required" }, { status: 400 })
    }
    const client = getAdminClient()
    const { data, error } = await client.from("creator_applications").update({ status }).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
