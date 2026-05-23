"use client"

import { useStore } from "@/lib/store"
import { X, AlertTriangle } from "lucide-react"
import { useEffect, useCallback, useState } from "react"
import { useFocusTrap } from "@/lib/useFocusTrap"
import { getWhatsAppUrl, downloadCartInvoice, downloadCartExcel } from "@/lib/utils"
import { useSaveOrder } from "@/lib/use-save-order"
import { useSiteConfig } from "@/lib/theme-provider"
import { useRouter } from "next/navigation"

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, lang, updateQuantity, clearCart } = useStore()
  const { whatsapp } = useSiteConfig()
  const saveOrder = useSaveOrder()
  const router = useRouter()
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({})
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    if (open) {
      const map: Record<string, string> = {}
      cart.forEach(i => { map[i.product_id] = String(i.quantity) })
      setQtyInputs(map) // eslint-disable-line react-hooks/set-state-in-effect
      setShowClearConfirm(false)
    }
  }, [open, cart.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  const trapRef = useFocusTrap(open)
  const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0)

  const t = {
    en: { title: "Invoice", empty: "Cart is empty", total: "Total", checkout: "Send Invoice via WhatsApp", clear: "Clear Invoice", invoice: "Download PDF", excel: "Download Excel", code: "Code", name: "Name", qty: "Qty", weight: "Weight", pcs: "Pcs/Ctn", unique: "items", confirm: "Clear all items?", cancel: "Cancel", yes: "Yes, Clear" },
    ar: { title: "الفاتورة", empty: "السلة فارغة", total: "المجموع", checkout: "إرسال الفاتورة عبر واتساب", clear: "مسح الفاتورة", invoice: "تحميل PDF", excel: "تحميل Excel", code: "الرمز", name: "الاسم", qty: "الكمية", weight: "الوزن", pcs: "قطعة/كرتون", unique: "منتجات", confirm: "مسح جميع المنتجات؟", cancel: "إلغاء", yes: "نعم، مسح" },
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

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[1100]" onClick={onClose} style={{ background: "rgba(0,0,0,0.5)" }} aria-hidden="true" />
      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
        <div ref={trapRef} className="w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-fade-in" style={{ background: "var(--surface)" }} role="dialog" aria-modal="true" aria-label={t.title}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-base sm:text-lg font-semibold">{t.title} ({cart.length} {t.unique})</h2>
            <button onClick={onClose} className="p-1.5 min-touch flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <p style={{ color: "var(--text-muted)" }}>{t.empty}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)", fontSize: "11px", letterSpacing: "0.03em" }}>
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
                        <td className="px-3 py-2.5 align-middle text-sm font-medium truncate max-w-[120px] sm:max-w-[200px] text-center">
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

              <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t.total}</span>
                  <span className="text-base sm:text-lg font-bold" style={{ color: "var(--accent)" }}>{totalQty}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => downloadCartInvoice(cart, lang)} className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm transition-colors min-touch flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                    {t.invoice}
                  </button>
                  <button onClick={() => downloadCartExcel(cart, lang)} className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm transition-colors min-touch flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                    {t.excel}
                  </button>
                  {showClearConfirm ? (
                    <div className="flex gap-2 flex-1">
                      <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm transition-colors min-touch flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                        {t.cancel}
                      </button>
                      <button onClick={() => { clearCart(); setShowClearConfirm(false) }} className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm transition-colors min-touch flex items-center justify-center gap-1.5" style={{ background: "#dc2626", color: "#fff" }}>
                        <AlertTriangle size={14} /> {t.yes}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowClearConfirm(true)} className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm transition-colors min-touch flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                      {t.clear}
                    </button>
                  )}
                  <button onClick={handleCheckout}
                    className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm text-center font-medium transition-opacity hover:opacity-90 min-touch flex items-center justify-center"
                    style={{ background: "var(--wa)", color: "#fff" }}
                  >
                    {t.checkout}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
