import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { generatePromoCodes } from "@/lib/promo-codes"

export async function POST(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { count } = await req.json()
    const num = typeof count === "number" && count > 0 && count <= 50000 ? count : 15000
    const codes = generatePromoCodes(num)
    const rows = codes.map(code => ({ code }))
    const { error } = await getAdminClient().from("promo_codes").insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ generated: codes.length })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const client = getAdminClient()
    const { data, error } = await client.from("promo_codes").select("id, code, is_used, used_by_customer_id, used_at, created_at").order("id", { ascending: false }).limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { count: total } = await client.from("promo_codes").select("*", { count: "exact", head: true })
    const { count: used } = await client.from("promo_codes").select("*", { count: "exact", head: true }).eq("is_used", true)
    return NextResponse.json({ codes: data || [], stats: { total: total || 0, used: used || 0 } })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
