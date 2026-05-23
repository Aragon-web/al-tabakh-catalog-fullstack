import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false }).limit(50)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Order must include items" }, { status: 400 })
    }
    let customerId: number | null = null
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (token) {
      const client = getAdminClient()
      const { data: cust } = await client.from("customers").select("id").eq("auth_token", token).maybeSingle()
      if (cust) customerId = cust.id
    }

    const client = getAdminClient()
    const { data, error } = await client.from("orders").insert({
      items: body.items,
      total: body.total || 0,
      customer_name: body.customer_name || "",
      customer_phone: body.customer_phone || "",
      notes: body.notes || "",
      status: "pending",
      customer_id: customerId,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}