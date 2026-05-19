"use client"

import { useStore } from "@/lib/store"
import { ShoppingCart, Eye } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"
import { ProductQuickView } from "./ProductQuickView"
import type { Product } from "@/lib/types"

export function ProductCard({ product }: { product: Product }) {
  const { lang, addToCart, cartIds } = useStore()
  const [imgError, setImgError] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const inCart = cartIds.has(product.id)

  const name = lang === "en" ? product.name_en : product.name_ar
  const desc = lang === "en" ? product.desc_en : product.desc_ar

  return (
    <>
      <div
        className="group relative rounded-lg sm:rounded-xl overflow-hidden transition-all duration-150 active:scale-[0.97] sm:hover:scale-[1.02] sm:hover:shadow-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {product.is_new && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
            {lang === "en" ? "NEW" : "جديد"}
          </span>
        )}

        <div className="aspect-square relative overflow-hidden cursor-pointer" style={{ background: "var(--surface-2)" }} onClick={() => setShowDetail(true)}>
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-110"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
              <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/10 transition-colors hidden sm:flex items-center justify-center">
            <span className="opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-gray-800">
              <Eye size={14} /> {lang === "en" ? "Quick View" : "عرض سريع"}
            </span>
          </div>
        </div>

        <div className="p-2 sm:p-3 space-y-1 sm:space-y-1.5">
          <h3 className="text-xs sm:text-sm font-semibold truncate cursor-pointer" onClick={() => setShowDetail(true)}>{name}</h3>
          {desc && <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: "var(--text-muted)" }}>{desc}</p>}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs" style={{ color: "var(--text-secondary)" }}>
            {product.weight && <span>{product.weight}</span>}
            {product.pieces_per_carton && <span className="hidden sm:inline">· {product.pieces_per_carton} pcs</span>}
          </div>
          <div className="flex items-center justify-between pt-0.5 sm:pt-1">
            <span className="text-sm sm:text-base font-bold" style={{ color: "var(--accent)" }}>
              {formatPrice(product.price)}
            </span>
            <button
              onClick={() => addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, price: product.price, quantity: 1, weight: product.weight })}
              className="p-1.5 sm:p-2 min-touch flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90"
              style={{
                background: inCart ? "var(--accent)" : "var(--surface-2)",
                color: inCart ? "#fff" : "var(--text-secondary)"
              }}
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>

      {showDetail && <ProductQuickView product={product} onClose={() => setShowDetail(false)} />}
    </>
  )
}
