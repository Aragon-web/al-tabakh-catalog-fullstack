"use client"

import { Package, Tags, ShoppingCart, Users, MessageSquare, AlertTriangle, RefreshCw, TrendingUp, Star } from "lucide-react"
import type { Product, Category, Order } from "@/lib/types"
import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface Props {
  products: Product[]
  categories: Category[]
  orders: Order[]
  customersCount: number
  messagesCount: number
  token: string
  showToast: (type: "success" | "error", text: string) => void
  onRefresh: () => void
}

export function DashboardSection({ products, categories, orders, customersCount, messagesCount, token, showToast, onRefresh }: Props) {
  const [seeding, setSeeding] = useState(false)
  const { lang } = useStore()
  const t = adminT[lang]

  const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})
  const lowStock = products.filter(p => p.stock != null && p.stock >= 0 && p.stock <= 5)
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5)
  const maxStatus = Math.max(...Object.values(ordersByStatus), 1)

  const topProducts = useMemo(() => {
    const count: Record<string, { name: string; qty: number }> = {}
    orders.forEach(o => o.items?.forEach(item => {
      const key = item.product_id || item.name_en
      if (!count[key]) count[key] = { name: item.name_en, qty: 0 }
      count[key].qty += item.quantity || 1
    }))
    return Object.values(count).sort((a, b) => b.qty - a.qty).slice(0, 5)
  }, [orders])

  const monthlyOrders = useMemo(() => {
    const months: Record<string, number> = {}
    orders.forEach(o => {
      if (!o.created_at) return
      const key = o.created_at.slice(0, 7)
      months[key] = (months[key] || 0) + 1
    })
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  }, [orders])

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
          { icon: Package, label: t.statProducts, value: products.length, color: "var(--accent)" },
          { icon: Tags, label: t.statCategories, value: categories.length, color: "#3B82F6" },
          { icon: ShoppingCart, label: t.statOrders, value: orders.length, color: "var(--wa)" },
          { icon: Users, label: t.statCustomers, value: customersCount, color: "#8B5CF6" },
          { icon: MessageSquare, label: t.statMessages, value: messagesCount, color: "#F59E0B" },
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
          <h3 className="text-sm font-bold mb-3">{t.ordersByStatus}</h3>
          <div className="space-y-3">
            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
              <div key={s}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[s] || "#6B7280" }} />
                    <span style={{ color: "var(--text-secondary)" }}>{t[s as keyof typeof t] as string}</span>
                  </div>
                  <span className="font-medium">{ordersByStatus[s] || 0}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${((ordersByStatus[s] || 0) / maxStatus) * 100}%`, background: statusColors[s] || "#6B7280" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-bold mb-3">{t.recentOrders}</h3>
          {recentOrders.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.noOrdersYet}</p>
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

      {/* Monthly trend + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly orders */}
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><TrendingUp size={14} />{t.monthlyOrders}</h3>
          {monthlyOrders.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.noOrderData}</p>
          ) : (
            <div className="space-y-2">
              {monthlyOrders.map(([month, count]) => {
                const maxMonthly = Math.max(...monthlyOrders.map(([, c]) => c), 1)
                const label = new Date(month + "-01").toLocaleDateString("en-US", { year: "2-digit", month: "short" })
                return (
                  <div key={month}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxMonthly) * 100}%`, background: "var(--accent)" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Star size={14} />{t.topProducts}</h3>
          {topProducts.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.noOrderData}</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => {
                const maxQty = topProducts[0]?.qty || 1
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium flex-shrink-0" style={{ color: "var(--accent)" }}>#{i + 1}</span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="font-medium flex-shrink-0 ml-2">{p.qty}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(p.qty / maxQty) * 100}%`, background: "#8B5CF6" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: "#EF4444" }} />
            <h3 className="text-sm font-bold" style={{ color: "#EF4444" }}>{t.lowStockAlert} ({lowStock.length})</h3>
          </div>
          <div className="space-y-1.5">
            {lowStock.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="truncate">{p.name_en}</span>
                <span className="font-medium flex-shrink-0" style={{ color: p.stock === 0 ? "#EF4444" : "#F59E0B" }}>
                  {p.stock === 0 ? t.outOfStock : `${p.stock} ${t.left}`}
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
        {seeding ? t.importing : t.importProducts}
      </button>
    </div>
  )
}
