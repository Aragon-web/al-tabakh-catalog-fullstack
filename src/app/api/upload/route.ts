import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAuth } from "@/lib/api-auth"
import sharp from "sharp"

export async function POST(req: Request) {
  try {
    const auth = verifyAuth(req)
    if (auth !== true) {
      return auth
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"]
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, GIF allowed." }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())

    let uploadBuf = buf
    let contentType = file.type
    let filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    if (ext !== "gif" && ext !== "webp") {
      uploadBuf = await sharp(buf).webp({ quality: 80 }).toBuffer()
      contentType = "image/webp"
      filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: existing } = await supabase.storage.getBucket("product-images")
    if (!existing) {
      await supabase.storage.createBucket("product-images", { public: true })
    }

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filename, uploadBuf, { contentType, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
