"use client"

import { useStore } from "@/lib/store"
import { ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { ProductQuickView } from "./ProductQuickView"
import Link from "next/link"
import type { Product } from "@/lib/types"

export function ProductCard({ product }: { product: Product }) {
  const { lang, addToCart, cartIds, categories } = useStore()
  const [imgError, setImgError] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const inCart = cartIds.has(product.id)

  const name = lang === "en" ? product.name_en : product.name_ar
  const cat = categories.find(c => c.id === product.category_id)

  const outOfStock = product.stock === 0

  return (
    <>
      <div
        className="group relative rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.97] sm:hover:scale-[1.03] sm:hover:shadow-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {product.is_new && (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider" style={{ background: "var(--accent)", color: "#fff" }}>
            {lang === "en" ? "NEW" : "جديد"}
          </span>
        )}

        <Link href={`/product/${product.id}`} className="block aspect-square relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
          {product.image_url && !imgError ? (
            <Image
              src={product.image_url}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 sm:group-hover:scale-110"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6" style={{ background: "var(--surface-2)" }}>
              <img src="/placeholder-product.svg" alt="" className="w-full h-full object-contain opacity-40" /> {/* eslint-disable-line @next/next/no-img-element */}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/20 transition-colors" />
          {product.weight && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.9)" }}>
              {product.weight}
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
              <span className="text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.7)" }}>
                {lang === "en" ? "Out of Stock" : "نفذ من المخزون"}
              </span>
            </div>
          )}
        </Link>

        <div className="p-2.5 sm:p-3 space-y-1.5">
          {cat && cat.id !== "all" && (
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {lang === "en" ? cat.name_en : cat.name_ar}
            </p>
          )}

          <Link href={`/product/${product.id}`}>
            <h3 className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2 hover:underline">{name}</h3>
          </Link>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs" style={{ color: "var(--text-muted)" }}>
            {product.pieces_per_carton && (
              <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)" }}>
                {product.pieces_per_carton} {lang === "en" ? "pcs" : "قطعة"}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDetail(true)}
                className="p-1.5 rounded-lg transition-colors min-touch flex items-center justify-center"
                style={{ color: "var(--text-muted)" }}
                aria-label="Quick view"
              >
                <Eye size={13} />
              </button>
              <button
                onClick={() => addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, quantity: 1, weight: product.weight, pieces_per_carton: product.pieces_per_carton })}
                className="p-1.5 sm:p-2 min-touch flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90"
                style={{
                  background: inCart ? "var(--accent)" : "var(--surface-2)",
                  color: inCart ? "#fff" : "var(--text-secondary)"
                }}
                aria-label="Add to cart"
              >
                <ShoppingCart size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetail && <ProductQuickView product={product} onClose={() => setShowDetail(false)} />}
    </>
  )
}
