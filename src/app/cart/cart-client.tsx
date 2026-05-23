"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { useSiteConfig } from "@/lib/theme-provider"
import { getWhatsAppUrl, downloadCartInvoice, downloadCartExcel } from "@/lib/utils"
import { useSaveOrder } from "@/lib/use-save-order"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function CartClient() {
  const { cart, lang, updateQuantity, clearCart } = useStore()
  const { whatsapp } = useSiteConfig()
  const saveOrder = useSaveOrder()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({})
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => setMounted(true), []) // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    if (!mounted) return
    const map: Record<string, string> = {}
    cart.forEach(i => { map[i.product_id] = String(i.quantity) })
    setQtyInputs(map) // eslint-disable-line react-hooks/set-state-in-effect
  }, [mounted, cart.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null

  const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0)

  const t = {
    en: { title: "Invoice", empty: "Your cart is empty", total: "Total", clear: "Clear Invoice", order: "Send Invoice via WhatsApp", back: "Back to Catalog", invoice: "Download PDF", excel: "Download Excel", code: "Code", name: "Name", qty: "Qty", weight: "Weight", pcs: "Pcs/Ctn", unique: "items", confirm: "Clear all items?", cancel: "Cancel", yes: "Yes, Clear" },
    ar: { title: "الفاتورة", empty: "سلتك فارغة", total: "المجموع", clear: "مسح الفاتورة", order: "إرسال الفاتورة عبر واتساب", back: "العودة إلى الكتالوج", invoice: "تحميل PDF", excel: "تحميل Excel", code: "الرمز", name: "الاسم", qty: "الكمية", weight: "الوزن", pcs: "قطعة/كرتون", unique: "منتجات", confirm: "مسح جميع المنتجات؟", cancel: "إلغاء", yes: "نعم، مسح" },
  }[lang]

  const handleQtyInput = (productId: string, raw: string) => {
    setQtyInputs(prev => ({ ...prev, [productId]: raw }))
    if (raw.includes(".") || raw.includes(",")) return
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= 1) updateQuantity(productId, num)
  }

  const generateOrderMessage = () => {
    const lines = cart.map((i, idx) =>
      `${idx + 1}. ${lang === "en" ? i.name_en : i.name_ar} x${i.quantity}${i.pieces_per_carton ? ` (${i.pieces_per_carton} ${lang === "en" ? "pcs/ctn" : "قطعة/كرتون"})` : ""}`
    )
    lines.push(`${t.total}: ${totalQty}`)
    return lines.join("\n")
  }

  const waUrl = getWhatsAppUrl(whatsapp.orderTarget, `New Order:\n${generateOrderMessage()}`)

  function handleCheckout() {
    downloadCartInvoice(cart, lang)
    const { id } = saveOrder(cart)
    window.open(waUrl, "_blank")
    router.push(`/order/confirmation/${id}`)
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t.title}</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
            <Link href="/" className="inline-block px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              {t.back}
            </Link>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--surface-2)", color: "var(--text-muted)", fontSize: "11px", letterSpacing: "0.03em" }}>
                    <th className="px-3 py-2.5 text-center font-medium w-8">#</th>
                    <th className="px-3 py-2.5 text-center font-medium">{t.code}</th>
                    <th className="px-3 py-2.5 text-center font-medium">{t.name}</th>
                     <th className="px-3 py-2.5 text-center font-medium w-16">{t.qty}</th>
                     <th className="px-3 py-2.5 text-center font-medium hidden sm:table-cell">{t.weight}</th>
                     <th className="px-3 py-2.5 text-center font-medium hidden sm:table-cell">{t.pcs}</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.product_id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-3 py-2.5 align-middle text-xs text-center" style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td className="px-3 py-2.5 align-middle text-xs font-mono text-center" style={{ color: "var(--text-muted)" }}>{item.product_id}</td>
                      <td className="px-3 py-2.5 align-middle text-sm font-medium truncate max-w-[140px] sm:max-w-[260px] text-center">
                        {lang === "en" ? item.name_en : item.name_ar}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-center">
                        <input type="number" step="1" min="1" value={qtyInputs[item.product_id] ?? String(item.quantity)}
                          onChange={e => handleQtyInput(item.product_id, e.target.value)}
                          style={{ width: "56px", padding: "14px 4px", textAlign: "center", fontSize: "14px", fontWeight: 700, borderRadius: "6px", background: "var(--surface-2)", border: "none", outline: "none", MozAppearance: "textfield", minHeight: "44px", lineHeight: 1 }}
                        />
                      </td>
                      <td className="px-3 py-2.5 align-middle text-xs text-center hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>{item.weight || "—"}</td>
                      <td className="px-3 py-2.5 align-middle text-xs text-center hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>{item.pieces_per_carton || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ background: "var(--surface-2)" }}>
              <span className="text-base sm:text-lg font-bold">{t.total}</span>
              <span className="text-xl sm:text-2xl font-bold" style={{ color: "var(--accent)" }}>{totalQty}</span>
            </div>

            <div className="flex flex-wrap gap-3 p-4 sm:p-6">
              {showClearConfirm ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setShowClearConfirm(false)} className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm min-touch flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                    {t.cancel}
                  </button>
                  <button onClick={() => { clearCart(); setShowClearConfirm(false) }} className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm min-touch flex items-center justify-center gap-1.5" style={{ background: "#dc2626", color: "#fff" }}>
                    <AlertTriangle size={14} /> {t.yes}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm min-touch flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                  {t.clear}
                </button>
              )}
              <button onClick={() => downloadCartInvoice(cart, lang)} className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm min-touch flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {t.invoice}
              </button>
              <button onClick={() => downloadCartExcel(cart, lang)} className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm min-touch flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {t.excel}
              </button>
              <button onClick={handleCheckout}
                className="flex-1 text-center px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium min-touch flex items-center justify-center"
                style={{ background: "var(--wa)", color: "#fff" }}
              >
                {t.order}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
