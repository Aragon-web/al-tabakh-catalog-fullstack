import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: "Token and password required" }, { status: 400 })

    const client = getAdminClient()
    const { data: customer } = await client.from("customers")
      .select("id, reset_token_expires")
      .eq("reset_token", token)
      .maybeSingle()

    if (!customer) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    if (!customer.reset_token_expires || new Date(customer.reset_token_expires) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex")
    const authToken = crypto.randomUUID()
    await client.from("customers").update({
      password_hash: passwordHash,
      auth_token: authToken,
      reset_token: null,
      reset_token_expires: null,
    }).eq("id", customer.id)

    return NextResponse.json({ success: true, auth_token: authToken })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
