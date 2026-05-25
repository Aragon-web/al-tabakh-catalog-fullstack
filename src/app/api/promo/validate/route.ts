import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== "string" || !/^[A-Z0-9]{8}$/.test(code.toUpperCase())) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
    }

    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = getAdminClient()
    const { data: customer } = await client.from("customers").select("id, points").eq("auth_token", token).maybeSingle()
    if (!customer) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const normalizedCode = code.toUpperCase()
    const { data: promo } = await client.from("promo_codes").select("id, is_used, used_by_customer_id").eq("code", normalizedCode).maybeSingle()
    if (!promo) return NextResponse.json({ error: "Invalid promo code" }, { status: 404 })
    if (promo.is_used) return NextResponse.json({ error: "Code already used" }, { status: 409 })

    const { error: updateError } = await client.from("promo_codes").update({
      is_used: true,
      used_by_customer_id: customer.id,
      used_at: new Date().toISOString(),
    }).eq("id", promo.id).eq("is_used", false)

    if (updateError) return NextResponse.json({ error: "Failed to claim code" }, { status: 500 })

    await client.from("customers").update({ points: customer.points + 30 }).eq("id", customer.id)
    await client.from("loyalty_transactions").insert({
      customer_id: customer.id,
      points: 30,
      type: "earn",
      reason: "promo_code_entry",
    })

    const { data: updated } = await client.from("customers").select("points").eq("id", customer.id).single()
    return NextResponse.json({ success: true, points: updated?.points ?? customer.points + 30 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
