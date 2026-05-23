"use client"

import { Package, Tags, ShoppingCart, AlertTriangle, RefreshCw } from "lucide-react"
import type { Product, Category, Order } from "@/lib/types"
import { useState } from "react"

interface Props {
  products: Product[]
  categories: Category[]
  orders: Order[]
  token: string
  showToast: (type: "success" | "error", text: string) => void
  onRefresh: () => void
}

export function DashboardSection({ products, categories, orders, token, showToast, onRefresh }: Props) {
  const [seeding, setSeeding] = useState(false)

  const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})
  const lowStock = products.filter(p => p.stock != null && p.stock >= 0 && p.stock <= 5)
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5)

  const statusColors: Record<string, string> = {
    pending: "#F59E0B", confirmed: "#3B82F6", shipped: "#8B5CF6", delivered: "#10B981", cancelled: "#EF4444",
  }

  const runSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch("/api/seed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: token }) })
      const data = await res.json()
      showToast(data.error ? "error" : "success", data.message || data.error || "Done")
    } catch { showToast("error", "Seed failed") }
    setSeeding(false)
    onRefresh()
  }

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Package, label: "Products", value: products.length, color: "var(--accent)" },
          { icon: Tags, label: "Categories", value: categories.length, color: "#3B82F6" },
          { icon: ShoppingCart, label: "Orders", value: orders.length, color: "var(--wa)" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={15} style={{ color: s.color }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Orders by status + Recent orders row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by status */}
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-bold mb-3">Orders by Status</h3>
          <div className="space-y-2">
            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
              <div key={s} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[s] || "#6B7280" }} />
                  <span style={{ color: "var(--text-secondary)" }}>{s}</span>
                </div>
                <span className="font-medium">{ordersByStatus[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-bold mb-3">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No orders yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-mono">{o.id.slice(0, 8)}</span>
                    {o.customer_name && <span className="truncate" style={{ color: "var(--text-muted)" }}>{o.customer_name}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: statusColors[o.status] || "#6B7280", color: "#fff" }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: "#EF4444" }} />
            <h3 className="text-sm font-bold" style={{ color: "#EF4444" }}>Low Stock Alert ({lowStock.length})</h3>
          </div>
          <div className="space-y-1.5">
            {lowStock.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="truncate">{p.name_en}</span>
                <span className="font-medium flex-shrink-0" style={{ color: p.stock === 0 ? "#EF4444" : "#F59E0B" }}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seed button */}
      <button onClick={runSeed} disabled={seeding}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
        {seeding ? "Importing..." : "Import products from API"}
      </button>
    </div>
  )
}
