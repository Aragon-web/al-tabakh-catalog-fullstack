import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { product_id, rating, comment, image_url } = await req.json()
    if (!product_id || !rating || !comment) {
      return NextResponse.json({ error: "product_id, rating, and comment required" }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 })
    }

    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = getAdminClient()
    const { data: customer } = await client.from("customers").select("id, points").eq("auth_token", token).maybeSingle()
    if (!customer) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { data: existing } = await client.from("product_reviews").select("id").eq("product_id", product_id).eq("customer_id", customer.id).maybeSingle()
    if (existing) return NextResponse.json({ error: "Already reviewed this product" }, { status: 409 })

    const { data: review, error } = await client.from("product_reviews").insert({
      product_id, customer_id: customer.id, rating, comment, image_url: image_url || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const extraPoints = image_url ? 35 : 10
    await client.from("customers").update({ points: customer.points + extraPoints }).eq("id", customer.id)
    await client.from("loyalty_transactions").insert({
      customer_id: customer.id,
      points: extraPoints,
      type: "earn",
      reason: image_url ? "product_review_photo" : "product_review",
    })

    const { data: updated } = await client.from("customers").select("points").eq("id", customer.id).single()
    return NextResponse.json({ success: true, points: updated?.points ?? customer.points + extraPoints })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const productId = url.searchParams.get("product_id")
  if (!productId) return NextResponse.json({ error: "product_id required" }, { status: 400 })
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("product_reviews").select("id, rating, comment, image_url, created_at, customer_id").eq("product_id", productId).order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const customerIds = [...new Set((data || []).map(r => r.customer_id))]
    const { data: customers } = await client.from("customers").select("id, name").in("id", customerIds)
    const customerMap = Object.fromEntries((customers || []).map(c => [c.id, c.name]))

    const reviews = (data || []).map(r => ({
      ...r, customer_name: customerMap[r.customer_id] || "Unknown",
    }))
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
