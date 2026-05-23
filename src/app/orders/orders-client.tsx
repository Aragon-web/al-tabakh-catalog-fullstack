"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import Link from "next/link"
import type { Order } from "@/lib/types"

export function OrdersClient() {
  const { lang } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), []) // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    const stored = localStorage.getItem("altabakh_orders")
    if (stored) {
      try { setOrders(JSON.parse(stored)); setLoading(false) } catch { setLoading(false) } // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setLoading(false)
    }
  }, [])

  if (!mounted) return null

  const statusColors: Record<string, string> = {
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    shipped: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  }

  const statusLabels: Record<string, { en: string; ar: string }> = {
    pending: { en: "Pending", ar: "قيد الانتظار" },
    confirmed: { en: "Confirmed", ar: "تم التأكيد" },
    shipped: { en: "Shipped", ar: "تم الشحن" },
    delivered: { en: "Delivered", ar: "تم التوصيل" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
  }

  const t = {
    en: { title: "Order History", empty: "No orders yet", back: "Back to Catalog", total: "Total", status: "Status" },
    ar: { title: "سجل الطلبات", empty: "لا توجد طلبات بعد", back: "العودة إلى الكتالوج", total: "المجموع", status: "الحالة" },
  }[lang]

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t.title}</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
            <Link href="/" className="inline-block px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              {t.back}
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map(order => (
              <div key={order.id} className="p-3 sm:p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-mono" style={{ color: "var(--text-muted)" }}>{order.id.slice(0, 8)}...</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: statusColors[order.status] || "#6B7280", color: "#fff" }}>
                      {(statusLabels[order.status] || { en: order.status, ar: order.status })[lang]}
                    </span>
                    <span className="text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs sm:text-sm">
                      <span className="truncate mr-2">{lang === "en" ? item.name_en : item.name_ar} x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 sm:pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="text-sm sm:text-base font-bold">{t.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
