import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

async function getCustomerId(req: Request): Promise<number | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  const { data } = await getAdminClient().from("customers").select("id").eq("auth_token", token).maybeSingle()
  return data?.id ?? null
}

export async function GET(req: Request) {
  const customerId = await getCustomerId(req)
  if (!customerId) return NextResponse.json([])
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("cart_items").select("product_id, quantity").eq("customer_id", customerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const customerId = await getCustomerId(req)
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { items } = await req.json()
    if (!Array.isArray(items)) return NextResponse.json({ error: "items array required" }, { status: 400 })

    const client = getAdminClient()
    await client.from("cart_items").delete().eq("customer_id", customerId)

    if (items.length > 0) {
      const rows = items.map((i: { product_id: string; quantity: number }) => ({
        customer_id: customerId,
        product_id: i.product_id,
        quantity: i.quantity || 1,
      }))
      const { error } = await client.from("cart_items").insert(rows)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const customerId = await getCustomerId(req)
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const client = getAdminClient()
    await client.from("cart_items").delete().eq("customer_id", customerId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
