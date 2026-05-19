import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }
    const hash = crypto.createHash("sha256").update(password).digest("hex")
    const expected = process.env.ADMIN_PASSWORD_HASH
    if (!expected) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }
    if (hash === expected) {
      // Return the password itself as the token (verifyAuth will re-hash it)
      return NextResponse.json({ token: password, success: true })
    }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ authenticated: true })
}
