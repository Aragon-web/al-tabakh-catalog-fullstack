"use client"

import { useStore } from "@/lib/store"
import { ShoppingCart, X, Edit } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useFocusTrap } from "@/lib/useFocusTrap"
import Image from "next/image"
import type { Product } from "@/lib/types"

export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { lang, cart, addToCart, updateQuantity, cartIds } = useStore()
  const [imgError, setImgError] = useState(false)
  const [qtyInput, setQtyInput] = useState("")
  const [qtyError, setQtyError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const qty = qtyInput === "" ? 0 : parseInt(qtyInput, 10)

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setQtyInput(raw)
    if (raw.includes(".") || raw.includes(",")) {
      setQtyError(lang === "en" ? "Whole numbers only" : "الأعداد الصحيحة فقط")
    } else {
      setQtyError(null)
    }
  }
  const inCart = cartIds.has(product.id)
  const cartItem = cart.find(i => i.product_id === product.id)
  const currentQty = cartItem?.quantity ?? 0

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const trapRef = useFocusTrap(true)
  const name = lang === "en" ? product.name_en : product.name_ar
  const desc = lang === "en" ? product.desc_en : product.desc_ar

  const t = {
    en: { add: "Add to Cart", edit: "Edit", save: "Save", weight: "Weight", pieces: "Pieces per carton" },
    ar: { add: "أضف إلى السلة", edit: "تعديل", save: "حفظ", weight: "الوزن", pieces: "قطعة لكل كرتون" },
  }[lang]

  return (
    <>
      <div ref={trapRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={name}
      tabIndex={-1}
    >
      <div className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="aspect-video relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
            {product.image_url && !imgError ? (
              <Image src={product.image_url} alt={name} fill className="object-contain" onError={() => setImgError(true)} sizes="(max-width: 640px) 100vw, 512px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl" style={{ color: "var(--text-muted)" }}>
                {name.charAt(0)}
              </div>
            )}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-touch rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center" aria-label="Close">
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
          {desc && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            {product.weight && <span>{t.weight}: {product.weight}</span>}
            {product.pieces_per_carton && <span>{t.pieces}: {product.pieces_per_carton}</span>}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!inCart ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input type="number" step="1" min="1" value={qtyInput} placeholder={lang === "en" ? "Qty" : "الكمية"}
                    onChange={handleQtyChange}
                    style={{ background: "var(--surface-2)", border: "none", padding: "12px 14px", width: "90px", textAlign: "center", fontSize: "14px", fontWeight: 700, borderRadius: "8px", outline: "none", MozAppearance: "textfield" }}
                  />
                  <button
                    onClick={() => { if (qtyError || qtyInput === "" || qty < 1) return; addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, quantity: qty, weight: product.weight, pieces_per_carton: product.pieces_per_carton }); setQtyInput("") }}
                    className="flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium min-touch"
                    style={{ background: qtyInput === "" || qtyError || qty < 1 ? "var(--surface-2)" : "var(--accent)", color: qtyInput === "" || qtyError || qty < 1 ? "var(--text-muted)" : "#fff" }}
                  >
                    <ShoppingCart size={16} /> {t.add}
                  </button>
                </div>
                {qtyError && <p className="text-xs" style={{ color: "#ef4444" }}>{qtyError}</p>}
              </div>
            ) : !editing ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                  {lang === "en" ? `Qty: ${currentQty}` : `الكمية: ${currentQty}`}
                </span>
                <button onClick={() => { setQtyInput(String(currentQty)); setEditing(true) }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-opacity min-touch"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                  <Edit size={14} /> {t.edit}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input type="number" step="1" min="1" value={qtyInput}
                    onChange={handleQtyChange}
                    style={{ background: "var(--surface-2)", border: "none", padding: "12px 14px", width: "90px", textAlign: "center", fontSize: "14px", fontWeight: 700, borderRadius: "8px", outline: "none", MozAppearance: "textfield" }}
                  />
                  <button
                    onClick={() => { if (qtyError || qtyInput === "" || qty < 1) return; updateQuantity(product.id, qty); setQtyInput(""); setEditing(false) }}
                    className="flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium min-touch"
                    style={{ background: qtyInput === "" || qtyError || qty < 1 ? "var(--surface-2)" : "var(--accent)", color: qtyInput === "" || qtyError || qty < 1 ? "var(--text-muted)" : "#fff" }}
                  >
                    {t.save}
                  </button>
                </div>
                {qtyError && <p className="text-xs" style={{ color: "#ef4444" }}>{qtyError}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
