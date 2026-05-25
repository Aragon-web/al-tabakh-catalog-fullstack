import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendContactNotification } from "@/lib/email"
import { verifyAuth } from "@/lib/api-auth"
import { verifyOrigin } from "@/lib/csrf"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const csrf = verifyOrigin(req)
  if (csrf !== true) return csrf
  try {
    const body = await req.json()
    const { name, email, subject, message, file_url } = body
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields except file are required" }, { status: 400 })
    }
    const { data, error } = await supabase.from("contacts").insert({ name, email, subject, message, file_url: file_url || null }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    sendContactNotification(name, email, subject, message, file_url).catch(() => {})
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}