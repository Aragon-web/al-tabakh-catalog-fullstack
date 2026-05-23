import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const client = getAdminClient()
    const { data: cust } = await client.from("customers").select("id").eq("auth_token", token).maybeSingle()
    if (!cust) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { data, error } = await client.from("loyalty_transactions").select("*").eq("customer_id", cust.id).order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}