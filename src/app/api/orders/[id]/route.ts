import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  const { id } = await params

  try {
    const body = await req.json()
    const { status } = body

    if (!status || !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const client = getAdminClient()
    const { data, error } = await client.from("orders").update({ status }).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
