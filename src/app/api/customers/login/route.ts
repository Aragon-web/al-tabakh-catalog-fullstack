import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import crypto from "crypto"
import { verifyOrigin } from "@/lib/csrf"

export async function POST(req: Request) {
  const csrf = verifyOrigin(req)
  if (csrf !== true) return csrf
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const client = getAdminClient()
    const password_hash = crypto.createHash("sha256").update(password).digest("hex")
    const { data, error } = await client.from("customers").select("*").eq("email", email).eq("password_hash", password_hash).maybeSingle()
    if (error || !data) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }
    const auth_token = crypto.randomUUID()
    await client.from("customers").update({ auth_token }).eq("id", data.id)
    return NextResponse.json({ id: data.id, name: data.name, email: data.email, phone: data.phone, points: data.points, auth_token })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}