import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const client = getAdminClient()
    const { data: customer } = await client.from("customers").select("id, name").eq("email", email).maybeSingle()
    if (!customer) return NextResponse.json({ success: true })

    const resetToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    await client.from("customers").update({ reset_token: resetToken, reset_token_expires: expires }).eq("id", customer.id)

    const { sendPasswordResetEmail } = await import("@/lib/email")
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"
    sendPasswordResetEmail(email, customer.name, `${baseUrl}/account/reset-password?token=${resetToken}`).catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
