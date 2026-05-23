import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get("id")
  if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 })
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("orders").select("*").eq("id", orderId).maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}