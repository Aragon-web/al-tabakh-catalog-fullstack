"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Search, Package, ChevronDown } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import { useSiteConfig } from "@/lib/theme-provider"
import type { Order } from "@/lib/types"

export function OrderTracker() {
  const { lang } = useStore()
  const { sections, content } = useSiteConfig()

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState(false)

  if (sections.order_tracker === false) return null

  const tracker = (content.order_tracker || {}) as Record<string, string | undefined>

  const t = {
    en: { title: String(tracker.title_en || "Track Your Order"), placeholder: String(tracker.placeholder_en || "Enter order ID (e.g. ord_...)"), search: "Track", notFound: "Order not found", status: "Status", items: "Items", total: "Total" },
    ar: { title: String(tracker.title_ar || "تتبع طلبك"), placeholder: String(tracker.placeholder_ar || "أدخل رقم الطلب (مثال ord_...)"), search: "تتبع", notFound: "الطلب غير موجود", status: "الحالة", items: "المنتجات", total: "المجموع" },
  }[lang]

  const statusLabels: Record<string, string> = {
    pending: lang === "en" ? "Pending" : "قيد الانتظار",
    confirmed: lang === "en" ? "Confirmed" : "تم التأكيد",
    shipped: lang === "en" ? "Shipped" : "تم الشحن",
    delivered: lang === "en" ? "Delivered" : "تم التوصيل",
    cancelled: lang === "en" ? "Cancelled" : "ملغي",
  }

  const statusColors: Record<string, string> = {
    pending: "#F59E0B", confirmed: "#3B82F6", shipped: "#8B5CF6", delivered: "#10B981", cancelled: "#EF4444",
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true); setError(""); setOrder(null)
    try {
      const res = await fetch(`/api/orders/lookup?id=${encodeURIComponent(orderId.trim())}`)
      if (res.ok) setOrder(await res.json())
      else setError(t.notFound)
    } catch { setError("Network error") }
    setLoading(false)
  }

  return (
    <div className="p-5 sm:p-6 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Package size={18} style={{ color: "var(--accent)" }} />
        <h2 className="heading text-base sm:text-lg font-bold">{t.title}</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="text" placeholder={t.placeholder} value={orderId} onChange={e => setOrderId(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.placeholder}
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        <button type="submit" disabled={loading || !orderId.trim()}
          className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
          style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
          {loading ? <Spinner size={14} /> : <Search size={14} />}
          {t.search}
        </button>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--accent)" }}>{error}</p>}
      {order && (
        <div className="mt-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full text-left px-3 py-2.5 min-h-[40px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{t.status}:</span>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: (statusColors[order.status] || "#6B7280"), color: "#fff" }}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <ChevronDown size={13} style={{ color: "var(--text-muted)", transform: expanded ? "rotate(180deg)" : "" }} />
          </button>
          {expanded && (
            <div className="px-3 pb-3 space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span>{lang === "en" ? item.name_en : item.name_ar} x{item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-1.5" style={{ borderTop: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <span>{t.total}</span>
              </div>
              <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>{new Date(order.created_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}