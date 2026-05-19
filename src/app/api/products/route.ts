import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("products").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("GET /api/products error:", error.message)
      return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error("GET /api/products exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const body = await req.json()
    const { data, error } = await client.from("products").insert(body).select().single()
    if (error) {
      console.error("POST /api/products error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error("POST /api/products exception:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
