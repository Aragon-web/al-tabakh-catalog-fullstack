import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("promo_codes")
      .select("used_by_customer_id")
      .eq("is_used", true)
      .not("used_by_customer_id", "is", null)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const eligibleCustomerIds = [...new Set((data || []).map(r => r.used_by_customer_id as number))]
    if (eligibleCustomerIds.length === 0) {
      return NextResponse.json({ entrants: [], count: 0 })
    }

    const { data: customers } = await client.from("customers")
      .select("id, name, phone, email, points")
      .in("id", eligibleCustomerIds)

    return NextResponse.json({ entrants: customers || [], count: eligibleCustomerIds.length })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
