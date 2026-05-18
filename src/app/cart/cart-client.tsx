"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
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

  const generateOrderMessage = () => {
    const lines = cart.map((i, idx) =>
      `${idx + 1}. ${lang === "en" ? i.name_en : i.name_ar} x${i.quantity} = ${formatPrice(i.price * i.quantity)}`
    )
    lines.push(`${t.total}: ${formatPrice(cartTotal)}`)
    return lines.join("\n")
  }

  const phone = "+9647733310100"
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`New Order:\n${generateOrderMessage()}`)}`

  function handleCheckout() {
    saveOrder(cart, cartTotal)
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 pt-28 pb-8">
        <h1 className="text-2xl font-bold mb-6">{t.title}</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
            <Link href="/" className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              {t.back}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex-1">
                  <p className="font-medium">{lang === "en" ? item.name_en : item.name_ar}</p>
                  <p className="text-sm" style={{ color: "var(--accent)" }}>{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold w-20 text-right" style={{ color: "var(--accent)" }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <span className="text-lg font-bold">{t.total}</span>
              <span className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{formatPrice(cartTotal)}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={clearCart} className="px-6 py-2.5 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {t.clear}
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCheckout}
                className="flex-1 text-center px-6 py-2.5 rounded-lg text-sm font-medium"
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
