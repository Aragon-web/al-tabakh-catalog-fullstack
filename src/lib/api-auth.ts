import { NextResponse } from "next/server"
import crypto from "crypto"

export function verifyAuth(req: Request): true | NextResponse {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  const expected = process.env.ADMIN_PASSWORD_HASH
  if (!expected) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }
  if (token && crypto.createHash("sha256").update(token).digest("hex") === expected) {
    return true
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
