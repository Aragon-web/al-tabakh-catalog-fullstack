import { NextResponse } from "next/server"
import crypto from "crypto"

function verifyToken(token: string, secret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [sessionId, proof] = parts
  const expected = crypto.createHmac("sha256", secret).update(sessionId).digest("hex")
  return proof === expected
}

export function verifyAuth(req: Request): true | NextResponse {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  const expected = process.env.ADMIN_PASSWORD_HASH
  if (!expected) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }
  if (token && verifyToken(token, expected)) {
    return true
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
