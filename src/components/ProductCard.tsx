"use client"

import { useStore } from "@/lib/store"
import { ShoppingCart, Eye } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"
import type { Product } from "@/lib/types"

export function ProductCard({ product }: { product: Product }) {
  const { lang, addToCart, cart } = useStore()
  const [imgError, setImgError] = useState(false)
  const inCart = cart.some(i => i.product_id === product.id)

  const name = lang === "en" ? product.name_en : product.name_ar
  const desc = lang === "en" ? product.desc_en : product.desc_ar

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-fade-in"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {product.is_new && (
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
          {lang === "en" ? "NEW" : "جديد"}
        </span>
      )}

      <div className="aspect-square relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold truncate">{name}</h3>
        {desc && <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{desc}</p>}
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          {product.weight && <span>{product.weight}</span>}
          {product.pieces_per_carton && <span>· {product.pieces_per_carton} pcs</span>}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold" style={{ color: "var(--accent)" }}>
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, price: product.price, quantity: 1, weight: product.weight })}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              background: inCart ? "var(--accent)" : "var(--surface-2)",
              color: inCart ? "#fff" : "var(--text-secondary)"
            }}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
