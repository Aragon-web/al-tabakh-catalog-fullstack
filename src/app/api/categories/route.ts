import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { logAdminAction } from "@/lib/audit"

export async function GET() {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("categories").select("*").order("sort_order", { ascending: true })
    if (error) {
      console.error("GET /api/categories error:", error.message)
      return NextResponse.json({ error: "Failed to load categories" }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error("GET /api/categories exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const body = await req.json()
    const { data, error } = await client.from("categories").insert(body).select().single()
    if (error) {
      console.error("POST /api/categories error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    logAdminAction("create", "category", data?.id || "", { name: body.name_en })
    return NextResponse.json(data)
  } catch (e) {
    console.error("POST /api/categories exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
