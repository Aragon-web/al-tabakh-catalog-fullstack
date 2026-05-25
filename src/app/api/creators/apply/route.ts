import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { name, phone, facebook_profile, statement } = await req.json()
    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone required" }, { status: 400 })
    }

    let kitchen_photo_url: string | null = null
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("kitchen_photo") as File | null
      if (file && file.size > 0) {
        const buf = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const filename = `creators/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseUrl && supabaseKey) {
          const { createClient } = await import("@supabase/supabase-js")
          const sb = createClient(supabaseUrl, supabaseKey)
          const { data: uploadData } = await sb.storage.from("product-images").upload(filename, buf, { contentType: file.type, upsert: false })
          if (uploadData) kitchen_photo_url = `${supabaseUrl}/storage/v1/object/public/product-images/${uploadData.path}`
        }
      }
    }

    const client = getAdminClient()
    const { data, error } = await client.from("creator_applications").insert({
      name, phone, facebook_profile: facebook_profile || null,
      kitchen_photo_url, statement: statement || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
