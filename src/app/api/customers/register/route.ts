import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import crypto from "crypto"
import { verifyOrigin } from "@/lib/csrf"

export async function POST(req: Request) {
  const csrf = verifyOrigin(req)
  if (csrf !== true) return csrf
  try {
    const { name, email, phone, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 })
    }
    const client = getAdminClient()
    const existing = await client.from("customers").select("id").eq("email", email).maybeSingle()
    if (existing.data) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

    const password_hash = crypto.createHash("sha256").update(password).digest("hex")
    const auth_token = crypto.randomUUID()

    const { data, error } = await client.from("customers").insert({
      name, email, phone: phone || null,
      password_hash, auth_token, points: 30,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await client.from("loyalty_transactions").insert({
      customer_id: data.id, points: 30, type: "earn", reason: "registration_bonus",
    })

    return NextResponse.json({ id: data.id, name: data.name, email: data.email, points: data.points, auth_token: data.auth_token })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}