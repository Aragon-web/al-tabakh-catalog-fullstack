import { NextResponse } from "next/server"

export function verifyOrigin(req: Request): true | NextResponse {
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  const allowed = process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"

  if (!origin && !referer) return true

  const source = origin || referer || ""
  if (!source.startsWith(allowed) && !source.startsWith("http://localhost")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return true
}
