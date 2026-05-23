"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { useSiteConfig } from "@/lib/theme-provider"
import { getWhatsAppUrl } from "@/lib/utils"
import { CheckCircle, Package, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { STORAGE_KEYS } from "@/lib/constants"

interface SavedOrder {
  id: string
  items: { product_id: string; name_en: string; name_ar: string; quantity: number; weight?: string }[]
  status: string
  created_at: string
}

export function OrderConfirmationClient({ orderId }: { orderId: string }) {
  const { lang } = useStore()
  const { whatsapp } = useSiteConfig()
  const [order, setOrder] = useState<SavedOrder | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (stored) {
        const orders: SavedOrder[] = JSON.parse(stored)
        const found = orders.find(o => o.id === orderId)
        if (found) setOrder(found) // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch {}
  }, [orderId])

  const t = {
    en: { title: "Order Confirmed", subtitle: "Thank you! Your order has been received.", id: "Order ID", date: "Date", status: "Status", items: "Items", total: "Total", pending: "Under Review", back: "Back to Home", track: "Track Order", contact: "Contact Us" },
    ar: { title: "تم تأكيد الطلب", subtitle: "شكراً لك! تم استلام طلبك.", id: "رقم الطلب", date: "التاريخ", status: "الحالة", items: "المنتجات", total: "المجموع", pending: "قيد المراجعة", back: "العودة إلى الرئيسية", track: "تتبع الطلب", contact: "اتصل بنا" },
  }[lang]

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(lang === "en" ? "en-US" : "ar-IQ", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const statusColor = (status: string) => {
    if (status === "delivered") return "#22C55E"
    if (status === "cancelled") return "#EF4444"
    return "#F59E0B"
  }

  const waUrl = getWhatsAppUrl(whatsapp.orderTarget, `${lang === "en" ? "Inquiry about order" : "استفسار عن الطلب"}: ${orderId}`)

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8">
        <div className="text-center mb-8">
          <CheckCircle size={48} className="mx-auto mb-3" style={{ color: "#22C55E" }} />
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
        </div>

        {!order && (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">{lang === "en" ? "Loading order details..." : "جاري تحميل تفاصيل الطلب..."}</p>
          </div>
        )}

        {order && (
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.id}</p>
                  <p className="text-sm font-mono font-medium">{order.id}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: `${statusColor(order.status)}20`, color: statusColor(order.status) }}>
                  <Clock size={12} />
                  {t.pending}
                </div>
              </div>

              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                <p>{t.date}: {formatDate(order.created_at)}</p>
              </div>

              <div className="border-t" style={{ borderColor: "var(--border)" }} />

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t.items} ({order.items.length})</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate mr-2">{lang === "en" ? item.name_en : item.name_ar}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span style={{ color: "var(--text-muted)" }}>x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <span className="font-bold">{t.total}</span>
                <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>{t.pending}</span>
              </div>
            </div>

            <div className="flex gap-2 p-4 sm:p-6 pt-0">
              <Link href={`/orders?order=${order.id}`}
                className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                <Package size={14} className="inline mr-1.5" />
                {t.track}
              </Link>
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--wa)", color: "#fff" }}>
                {t.contact}
              </a>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} />
            {t.back}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
