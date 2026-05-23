import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = url.searchParams.get("page")
  const section = url.searchParams.get("section")
  try {
    const client = getAdminClient()
    if (page && section) {
      const { data, error } = await client.from("page_content").select("*").eq("page", page).eq("section", section).maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data || { content: {} })
    }
    if (page) {
      const { data, error } = await client.from("page_content").select("*").eq("page", page).order("section")
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data || [])
    }
    const { data, error } = await client.from("page_content").select("*").order("page").order("section")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }) }
}

export async function PATCH(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { page, section, content } = await req.json()
    if (!page || !section || !content) return NextResponse.json({ error: "page, section, content required" }, { status: 400 })
    const client = getAdminClient()
    const { data, error } = await client.from("page_content").upsert({ page, section, content }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }
}

export async function DELETE(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth
  try {
    const { page, section } = await req.json()
    if (!page || !section) return NextResponse.json({ error: "page, section required" }, { status: 400 })
    const client = getAdminClient()
    const { error } = await client.from("page_content").delete().eq("page", page).eq("section", section)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }
}