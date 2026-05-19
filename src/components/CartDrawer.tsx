"use client"

import { useStore } from "@/lib/store"
import { X, Plus, Minus, Trash2 } from "lucide-react"
import { useEffect, useCallback } from "react"
import { formatPrice, getWhatsAppUrl } from "@/lib/utils"
import { useSaveOrder } from "@/lib/use-save-order"
import { WHATSAPP_PHONE } from "@/lib/constants"

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, lang, updateQuantity, clearCart, cartTotal } = useStore()
  const saveOrder = useSaveOrder()

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

  const t = {
    en: { title: "Your Cart", empty: "Cart is empty", total: "Total", checkout: "Order via WhatsApp", clear: "Clear" },
    ar: { title: "سلة التسوق", empty: "السلة فارغة", total: "المجموع", checkout: "طلب عبر واتساب", clear: "مسح" },
  }[lang]

  const generateOrderMessage = () => {
    const lines = cart.map((i, idx) =>
      `${idx + 1}. ${lang === "en" ? i.name_en : i.name_ar} x${i.quantity} = ${formatPrice(i.price * i.quantity)}`
    )
    lines.push(`${t.total}: ${formatPrice(cartTotal)}`)
    return lines.join("\n")
  }

  const waUrl = getWhatsAppUrl(WHATSAPP_PHONE, `New Order:\n${generateOrderMessage()}`)

  function handleCheckout() {
    saveOrder(cart, cartTotal)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} style={{ background: "rgba(0,0,0,0.5)" }} aria-hidden="true" />
      <div
        className="fixed top-0 h-full w-[85vw] sm:max-w-md z-[70] shadow-2xl animate-slide-in flex flex-col"
        style={{ background: "var(--surface)", insetInlineEnd: 0 }}
        role="dialog" aria-modal="true" aria-label={t.title}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 min-h-[52px]" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-base sm:text-lg font-semibold">{t.title} ({cart.length})</h2>
          <button onClick={onClose} className="p-1.5 min-touch flex items-center justify-center" style={{ color: "var(--text-muted)" }} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
          {cart.length === 0 ? (
            <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{lang === "en" ? item.name_en : item.name_ar}</p>
                  <p className="text-[11px] sm:text-xs" style={{ color: "var(--accent)" }}>{formatPrice(item.price)}</p>
                  {item.weight && <p className="text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>{item.weight}</p>}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 sm:p-1 min-touch flex items-center justify-center rounded" style={{ background: "var(--surface-3)" }} aria-label="Decrease quantity">
                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="text-sm font-medium w-5 sm:w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 sm:p-1 min-touch flex items-center justify-center rounded" style={{ background: "var(--surface-3)" }} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-3 sm:p-4 space-y-3 safe-bottom" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.total}</span>
              <span className="text-base sm:text-lg font-bold" style={{ color: "var(--accent)" }}>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={clearCart} className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm transition-colors min-touch flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                {t.clear}
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCheckout}
                className="flex-1 py-3 sm:py-2.5 rounded-lg text-sm text-center font-medium transition-opacity hover:opacity-90 min-touch flex items-center justify-center"
                style={{ background: "#25D366", color: "#fff" }}
              >
                {t.checkout}
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
