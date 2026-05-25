import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const client = getAdminClient()
    const { data: usedCodes, error } = await client.from("promo_codes")
      .select("used_by_customer_id")
      .eq("is_used", true)
      .not("used_by_customer_id", "is", null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const eligibleIds = [...new Set((usedCodes || []).map(r => r.used_by_customer_id as number))]
    if (eligibleIds.length === 0) {
      return NextResponse.json({ winner: null })
    }

    const winnerId = eligibleIds[Math.floor(Math.random() * eligibleIds.length)]
    const { data: winner } = await client.from("customers")
      .select("id, name, phone, email, points")
      .eq("id", winnerId)
      .single()

    return NextResponse.json({ winner, total_entrants: eligibleIds.length })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
