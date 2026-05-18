import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("categories").select("*").order("sort_order", { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const body = await req.json()
    const { data, error } = await client.from("categories").insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
