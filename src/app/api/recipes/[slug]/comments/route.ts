import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { comment } = await req.json()
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Comment required" }, { status: 400 })
    }

    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = getAdminClient()
    const { data: customer } = await client.from("customers").select("id, points").eq("auth_token", token).maybeSingle()
    if (!customer) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { slug } = await params
    const { data: recipe } = await client.from("recipes").select("id").eq("slug", slug).maybeSingle()
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 })

    const today = new Date().toISOString().slice(0, 10)
    const { count } = await client.from("recipe_comments").select("*", { count: "exact", head: true })
      .eq("recipe_id", recipe.id).eq("customer_id", customer.id).gte("created_at", today)

    if (count && count > 0) return NextResponse.json({ error: "Already commented today" }, { status: 429 })

    const { data: inserted, error } = await client.from("recipe_comments").insert({
      recipe_id: recipe.id, customer_id: customer.id, comment: comment.trim(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await client.from("customers").update({ points: customer.points + 5 }).eq("id", customer.id)
    await client.from("loyalty_transactions").insert({
      customer_id: customer.id, points: 5, type: "earn", reason: "recipe_engagement",
    })

    const { data: updated } = await client.from("customers").select("points").eq("id", customer.id).single()
    return NextResponse.json({ success: true, comment: inserted, points: updated?.points })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const client = getAdminClient()
    const { slug } = await params
    const { data: recipe } = await client.from("recipes").select("id").eq("slug", slug).maybeSingle()
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 })

    const { data, error } = await client.from("recipe_comments").select("id, comment, customer_id, created_at").eq("recipe_id", recipe.id).order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const customerIds = [...new Set((data || []).map(c => c.customer_id))]
    const { data: customers } = await client.from("customers").select("id, name").in("id", customerIds)
    const customerMap = Object.fromEntries((customers || []).map(c => [c.id, c.name]))

    const comments = (data || []).map(c => ({
      ...c, customer_name: customerMap[c.customer_id] || "Unknown",
    }))
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
