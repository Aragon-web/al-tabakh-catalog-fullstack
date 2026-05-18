import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  const { password } = await req.json()
  const hash = crypto.createHash("sha256").update(password).digest("hex")
  const expected = process.env.ADMIN_PASSWORD_HASH

  if (hash === expected) {
    const token = crypto.randomBytes(32).toString("hex")
    return NextResponse.json({ token, success: true })
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ authenticated: true })
}
