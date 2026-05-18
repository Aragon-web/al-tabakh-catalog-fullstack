"use client"

import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart, X, Check } from "lucide-react"
import { useState } from "react"
import type { Product } from "@/lib/types"

export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { lang, addToCart, cart, removeFromCart } = useStore()
  const [imgError, setImgError] = useState(false)
  const inCart = cart.some(i => i.product_id === product.id)

  const name = lang === "en" ? product.name_en : product.name_ar
  const desc = lang === "en" ? product.desc_en : product.desc_ar

  const t = {
    en: { add: "Add to Cart", remove: "Remove", weight: "Weight", pieces: "Pieces per carton", price: "Price" },
    ar: { add: "أضف إلى السلة", remove: "إزالة", weight: "الوزن", pieces: "قطعة لكل كرتون", price: "السعر" },
  }[lang]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="aspect-video relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
            {product.image_url && !imgError ? (
              <img src={product.image_url} alt={name} className="w-full h-full object-contain" onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl" style={{ color: "var(--text-muted)" }}>
                {name.charAt(0)}
              </div>
            )}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70">
            <X size={18} />
          </button>
          {product.is_new && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
              {lang === "en" ? "NEW" : "جديد"}
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <h2 className="text-base sm:text-lg font-bold">{name}</h2>
          {desc && <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            {product.weight && <span>{t.weight}: {product.weight}</span>}
            {product.pieces_per_carton && <span>{t.pieces}: {product.pieces_per_carton}</span>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xl sm:text-2xl font-bold" style={{ color: "var(--accent)" }}>
              {formatPrice(product.price)}
            </span>
            {inCart ? (
              <button
                onClick={() => removeFromCart(product.id)}
                className="flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
              >
                <Check size={16} /> {t.remove}
              </button>
            ) : (
              <button
                onClick={() => addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, price: product.price, quantity: 1, weight: product.weight })}
                className="flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium min-touch"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <ShoppingCart size={16} /> {t.add}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
