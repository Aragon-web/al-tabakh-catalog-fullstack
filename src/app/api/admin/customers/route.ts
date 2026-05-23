import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("customers").select("id, name, email, phone, points, created_at").order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { customer_id, points, reason } = await req.json()
    if (!customer_id || !reason || points === 0) {
      return NextResponse.json({ error: "customer_id, points, and reason required" }, { status: 400 })
    }
    const client = getAdminClient()
    const { data: cust } = await client.from("customers").select("id, points").eq("id", customer_id).single()
    if (!cust) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

    const newPoints = Math.max(0, cust.points + points)
    const { error: updateErr } = await client.from("customers").update({ points: newPoints }).eq("id", customer_id)
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    const { error: txnErr } = await client.from("loyalty_transactions").insert({
      customer_id,
      points: Math.abs(points),
      type: points > 0 ? "earn" : "redeem",
      reason,
    })
    if (txnErr) console.error("Failed to record loyalty transaction:", txnErr.message)

    return NextResponse.json({ success: true, new_points: newPoints })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}