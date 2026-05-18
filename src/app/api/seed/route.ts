import { NextResponse } from "next/server"
import crypto from "crypto"
import https from "https"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function request(method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL)
    const opts: https.RequestOptions = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        "apikey": SUPABASE_KEY!,
        "Authorization": `Bearer ${SUPABASE_KEY!}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      rejectUnauthorized: false,
    }
    const req = https.request(opts, (res) => {
      let data = ""
      res.on("data", (c) => (data += c))
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(data ? JSON.parse(data) : null) } catch { resolve(null) }
        } else {
          reject(new Error(`${res.statusCode}: ${data.substring(0, 200)}`))
        }
      })
    })
    req.on("error", reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function fetchAPI(): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get("https://menu.orcatech.pro/api/markets/altabakh?format=json", { rejectUnauthorized: false }, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
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

  try {
    const apiData = await fetchAPI()

    const categories = new Map<string, { name_en: string; name_ar: string }>()
    const products: Record<string, unknown>[] = []

    if (apiData.categories) {
      for (const cat of apiData.categories) {
        const id = cat.slug || cat.id?.toString() || cat.name_en?.toLowerCase().replace(/\s+/g, "-")
        if (id) categories.set(id, { name_en: cat.name_en || cat.name, name_ar: cat.name_ar || "" })
      }
    }

    const items = apiData.products || apiData.results || []
    for (const p of items) {
      const desc = p.description_en || ""
      const weightMatch = desc.match(/Weight\s*:\s*([^\n]+)/i)
      const piecesMatch = desc.match(/Pieces\s*NO\s*:\s*(\d+)/i)
      const cats: string[] = []
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

    // Upsert categories via REST API
    for (const [id, cat] of categories) {
      await request("POST", `/rest/v1/categories?id=eq.${id}`, {
        id, name_en: cat.name_en, name_ar: cat.name_ar, sort_order: 0,
      })
    }

    // Upsert products in batches via REST API
    const batchSize = 10
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      await request("POST", "/rest/v1/products", batch)
    }

    return NextResponse.json({
      message: "Seed completed",
      products: products.length,
      categories: categories.size,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
