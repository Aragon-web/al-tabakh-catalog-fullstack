import { NextResponse, type NextRequest } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { logAdminAction } from "@/lib/audit"
import { COUNTRIES as staticCountries } from "@/lib/cities"

export async function GET(req: NextRequest) {
  const authResult = verifyAuth(req)
  if (authResult !== true) {
    const cookieToken = req.cookies.get("admin_token")?.value
    const expected = process.env.ADMIN_PASSWORD_HASH
    if (!cookieToken || !expected) return authResult
    const crypto = await import("crypto")
    const hash = crypto.createHash("sha256").update(cookieToken).digest("hex")
    if (hash !== expected) return authResult
  }
  try {
    const client = getAdminClient()
    const { data } = await client.from("settings").select("value").eq("key", "locations_countries").maybeSingle()
    return NextResponse.json(data?.value?.length ? data.value : staticCountries)
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  const authResult = verifyAuth(req)
  if (authResult !== true) {
    const cookieToken = req.cookies.get("admin_token")?.value
    const expected = process.env.ADMIN_PASSWORD_HASH
    if (!cookieToken || !expected) return authResult
    const crypto = await import("crypto")
    const hash = crypto.createHash("sha256").update(cookieToken).digest("hex")
    if (hash !== expected) return authResult
  }
  try {
    const body = await req.json()
    const client = getAdminClient()
    await client.from("settings").upsert(
      { key: "locations_countries", value: body, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    logAdminAction("save", "locations", "", { countryCount: Array.isArray(body) ? body.length : 0 })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: "Failed to save" }, { status: 500 }) }
}
