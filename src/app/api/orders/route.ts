import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false }).limit(50)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const client = getAdminClient()
    const body = await req.json()
    const { data, error } = await client.from("orders").insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
