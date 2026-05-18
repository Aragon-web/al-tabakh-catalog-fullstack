import { NextResponse } from "next/server"
import crypto from "crypto"

export function verifyAuth(req: Request): true | NextResponse {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // Accept any non-empty token (simple admin auth)
  if (token.length < 8) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
  return true
}
