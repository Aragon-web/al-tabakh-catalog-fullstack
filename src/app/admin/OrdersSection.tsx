"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronUp, Phone, User, FileText } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import type { Order } from "@/lib/types"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface Props {
  orders: Order[]
  token: string
  showToast: (type: "success" | "error", text: string) => void
  onRefresh: () => void
}

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const
const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", shipped: "#8B5CF6", delivered: "#10B981", cancelled: "#EF4444",
}
const PAGE_SIZE = 20

export function OrdersSection({ orders, token, showToast, onRefresh }: Props) {
  const { lang } = useStore(); const t = adminT[lang]
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const idMatch = o.id.toLowerCase().includes(q)
        const nameMatch = o.customer_name?.toLowerCase().includes(q)
        const phoneMatch = o.customer_phone?.includes(q)
        if (!idMatch && !nameMatch && !phoneMatch) return false
      }
      return true
    })
  }, [orders, search, statusFilter])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const sorted = useMemo(() => {
    return [...paged].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [paged])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1
    return c
  }, [orders])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) })
      if (res.ok) { showToast("success", `Order ${status}`); onRefresh() }
      else { const err = await res.json(); showToast("error", err.error || "Update failed") }
    } catch { showToast("error", "Network error") }
    setUpdating(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold">{t.orders} ({filtered.length})</h2>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0) }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: statusFilter === s ? (STATUS_COLORS[s] || "var(--surface-2)") : "var(--surface-2)",
              color: statusFilter === s ? "#fff" : "var(--text-secondary)",
            }}>
            {s === "all" ? "All" : s}
            {s !== "all" && <span className="opacity-70">({counts[s] || 0})</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input type="text" placeholder={t.searchOrders} value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none" aria-label={t.searchOrders}
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>{t.noOrders}</p>
        ) : sorted.map(o => {
          const isExpanded = expanded === o.id
          return (
            <div key={o.id} className="rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {/* Header row */}
              <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : o.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>{o.id.slice(0, 8)}...</span>
                  {o.customer_name && (
                    <span className="text-xs font-medium truncate hidden sm:block">{o.customer_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: STATUS_COLORS[o.status] || "#6B7280", color: "#fff" }}>{o.status}</span>
                  <span className="text-[10px] hidden sm:block" style={{ color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString()}</span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {/* Customer info */}
                  {(o.customer_name || o.customer_phone || o.notes) && (
                    <div className="pt-3 space-y-1.5">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.customer}</h4>
                      {o.customer_name && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <User size={12} style={{ color: "var(--text-muted)" }} />
                          <span>{o.customer_name}</span>
                        </div>
                      )}
                      {o.customer_phone && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone size={12} style={{ color: "var(--text-muted)" }} />
                          <span dir="ltr">{o.customer_phone}</span>
                        </div>
                      )}
                      {o.notes && (
                        <div className="flex items-start gap-1.5 text-xs">
                          <FileText size={12} style={{ color: "var(--text-muted)" }} className="mt-0.5" />
                          <span style={{ color: "var(--text-secondary)" }}>{o.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>{t.items} ({o.items.length})</h4>
                    <div className="space-y-1">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="truncate mr-2">{item.name_en} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update */}
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>{t.updateStatus}</h4>
                    <div className="flex gap-1 flex-wrap">
                      {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
                        <button key={s} onClick={() => updateStatus(o.id, s)} disabled={updating === o.id || s === o.status}
                          className="text-[10px] px-2 py-1 rounded font-medium transition-opacity disabled:opacity-40"
                          style={{ background: STATUS_COLORS[s] || "#6B7280", color: "#fff", opacity: s === o.status ? 0.4 : 1 }}>
                          {updating === o.id ? <Spinner size={12} /> : (t as Record<string, string>)[s] || s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order ID + date footer */}
                  <div className="flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>{t.orderId}: {o.id}</span>
                    <span>{new Date(o.created_at).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page === 0 ? 0.4 : 1 }}>{t.prev}</button>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.pageOf} {page + 1} / {pageCount}</span>
          <button onClick={() => setPage(Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page >= pageCount - 1 ? 0.4 : 1 }}>{t.next}</button>
        </div>
      )}
    </div>
  )
}
