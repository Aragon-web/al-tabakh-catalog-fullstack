"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { formatPrice, getWhatsAppUrl } from "@/lib/utils"
import { useSaveOrder } from "@/lib/use-save-order"
import { Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"

export function CartClient() {
  const { cart, lang, updateQuantity, cartTotal, clearCart } = useStore()
  const saveOrder = useSaveOrder()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const t = {
    en: { title: "Shopping Cart", empty: "Your cart is empty", total: "Total", clear: "Clear Cart", order: "Order via WhatsApp", back: "Back to Catalog" },
    ar: { title: "سلة التسوق", empty: "سلتك فارغة", total: "المجموع", clear: "مسح السلة", order: "طلب عبر واتساب", back: "العودة إلى الكتالوج" },
  }[lang]

  const phone = "+9647733310100"

  const generateOrderMessage = () => {
    const lines = cart.map((i, idx) =>
      `${idx + 1}. ${lang === "en" ? i.name_en : i.name_ar} x${i.quantity} = ${formatPrice(i.price * i.quantity)}`
    )
    lines.push(`${t.total}: ${formatPrice(cartTotal)}`)
    return lines.join("\n")
  }

  const waUrl = getWhatsAppUrl(phone, `New Order:\n${generateOrderMessage()}`)

  function handleCheckout() {
    saveOrder(cart, cartTotal)
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t.title}</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
            <Link href="/" className="inline-block px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              {t.back}
            </Link>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium truncate">{lang === "en" ? item.name_en : item.name_ar}</p>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--accent)" }}>{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2 min-touch flex items-center justify-center rounded-lg" style={{ background: "var(--surface-2)" }} aria-label="Decrease quantity">
                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2 min-touch flex items-center justify-center rounded-lg" style={{ background: "var(--surface-2)" }} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold text-sm sm:text-base w-16 sm:w-20 text-right flex-shrink-0" style={{ color: "var(--accent)" }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <span className="text-base sm:text-lg font-bold">{t.total}</span>
              <span className="text-xl sm:text-2xl font-bold" style={{ color: "var(--accent)" }}>{formatPrice(cartTotal)}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={clearCart} className="px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm min-touch flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {t.clear}
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCheckout}
                className="flex-1 text-center px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium min-touch flex items-center justify-center"
                style={{ background: "#25D366", color: "#fff" }}
              >
                {t.order}
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
