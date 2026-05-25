import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { verifyAuth } from "@/lib/api-auth"
import { logAdminAction } from "@/lib/audit"
import type { SupabaseClient } from "@supabase/supabase-js"

async function getProductOrder(client: SupabaseClient) {
  const { data } = await client.from("settings").select("value").eq("key", "product_order").single()
  return (data?.value as Record<string, number>) || {}
}

async function setProductOrder(client: SupabaseClient, order: Record<string, number>) {
  await client.from("settings").upsert({ key: "product_order", value: order, updated_at: new Date().toISOString() })
}

export async function PATCH(req: Request) {
  const auth = verifyAuth(req)
  if (auth !== true) return auth

  try {
    const client = getAdminClient()
    const body = await req.json()
    const { action, product_ids, category_id, reorder } = body

    if (action === "move") {
      if (!Array.isArray(product_ids) || product_ids.length === 0) {
        return NextResponse.json({ error: "product_ids required" }, { status: 400 })
      }
      const { error } = await client
        .from("products")
        .update({ category_id: category_id || "all" })
        .in("id", product_ids)
      if (error) throw error

      const order = await getProductOrder(client)
      let changed = false
      for (const id of product_ids) {
        if (id in order) { delete order[id]; changed = true }
      }
      if (changed) await setProductOrder(client, order)

      logAdminAction("batch_move", "product", product_ids.join(","), { category_id, count: product_ids.length })
      return NextResponse.json({ success: true, moved: product_ids.length })
    }

    if (action === "reorder") {
      if (!Array.isArray(reorder) || reorder.length === 0) {
        return NextResponse.json({ error: "reorder array required" }, { status: 400 })
      }
      const order = await getProductOrder(client)
      for (const item of reorder) {
        order[item.id] = item.sort_order
      }
      await setProductOrder(client, order)
      logAdminAction("batch_reorder", "product", "", { count: reorder.length })
      return NextResponse.json({ success: true, reordered: reorder.length })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (e: unknown) {
    console.error("PATCH /api/products/batch error:", e)
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}