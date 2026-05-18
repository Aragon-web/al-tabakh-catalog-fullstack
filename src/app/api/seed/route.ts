import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"
import https from "https"

async function fetchAPI(): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get("https://menu.orcatech.pro/api/markets/altabakh?format=json", { rejectUnauthorized: false }, (res) => {
      let data = ""
      res.on("data", (chunk) => data += chunk)
      res.on("end", () => {
        try { resolve(JSON.parse(data)) } catch (e: any) { reject(new Error("JSON parse: " + e.message)) }
      })
    }).on("error", reject)
  })
}

export async function POST(req: Request) {
  const { password } = await req.json()
  const hash = crypto.createHash("sha256").update(password).digest("hex")
  if (hash !== process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: existing } = await supabaseAdmin.from("products").select("id").limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json({ message: "Database already has products. Delete them first if you want to re-seed." })
  }

  try {
    const apiData = await fetchAPI()

    const categories = new Map<string, { name_en: string; name_ar: string }>()
    const products: Record<string, unknown>[] = []

    if (apiData.categories) {
      for (const cat of apiData.categories) {
        const id = cat.slug || cat.id?.toString() || cat.name_en?.toLowerCase().replace(/\s+/g, "-")
        if (id) {
          categories.set(id, { name_en: cat.name_en || cat.name, name_ar: cat.name_ar || "" })
        }
      }
    }

    if (apiData.products || apiData.results) {
      const items = apiData.products || apiData.results || []
      for (const p of items) {
        const desc = p.description_en || ""
        const weightMatch = desc.match(/Weight\s*:\s*([^\n]+)/i)
        const piecesMatch = desc.match(/Pieces\s*NO\s*:\s*(\d+)/i)

        const cats = []
        if (p.categories && Array.isArray(p.categories)) {
          for (const c of p.categories) {
            const id = c.slug || c.id?.toString() || c.name?.toLowerCase().replace(/\s+/g, "-")
            if (id) cats.push(id)
          }
        }

        products.push({
          id: p.id?.toString() || String(Date.now() + Math.random()),
          category_id: cats[0] || "all",
          name_en: p.name_en || p.name || "",
          name_ar: p.name_ar || "",
          desc_en: p.description_en || "",
          desc_ar: p.description_ar || "",
          weight: p.weight || (weightMatch ? weightMatch[1].trim() : ""),
          pieces_per_carton: p.pieces_per_carton || (piecesMatch ? piecesMatch[1] : ""),
          price: parseFloat(p.price) || 0,
          image_url: p.image ? `https://menu.orcatech.pro/${p.image}` : (p.image_url || ""),
          is_new: false,
          is_featured: false,
        })
      }
    }

    for (const [id, cat] of categories) {
      await supabaseAdmin.from("categories").upsert({
        id,
        name_en: cat.name_en,
        name_ar: cat.name_ar,
        sort_order: 0,
      }, { onConflict: "id" }).maybeSingle()
    }

    const batchSize = 50
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const { error } = await supabaseAdmin.from("products").upsert(batch as any, { onConflict: "id" })
      if (error) {
        return NextResponse.json({ error: error.message, at: i }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: "Seed completed",
      products: products.length,
      categories: categories.size,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, details: err.stack }, { status: 500 })
  }
}
