import { NextResponse } from "next/server"

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "").toLowerCase()
}

export function verifyOrigin(req: Request): true | NextResponse {
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  const allowed = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app")

  if (!origin && !referer) return true

  const source = origin || referer || ""
  const normalized = normalizeUrl(source)
  if (normalized.startsWith(allowed) || normalized.startsWith("http://localhost")) {
    return true
  }

  try {
    const sourceHost = new URL(normalized).hostname
    const allowedHost = new URL(allowed).hostname
    if (sourceHost === allowedHost) return true
    if (sourceHost.endsWith(".vercel.app")) return true
  } catch {
    // invalid URLs, fall through to reject
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
