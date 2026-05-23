"use client"

import { useStore } from "@/lib/store"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useCallback, useEffect } from "react"
import { useSiteConfig } from "@/lib/theme-provider"

export function LatestProducts() {
  const { lang, products, addToCart, cartIds, categories } = useStore()
  const { sections } = useSiteConfig()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollStart, setScrollStart] = useState(0)

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateScrollButtons, { passive: true })
    updateScrollButtons()
    return () => el.removeEventListener("scroll", updateScrollButtons)
  }, [updateScrollButtons])

  if (!sections.latest_products) return null

  const latest = products.filter(p => p.is_new).slice(0, 12)

  if (latest.length === 0) return null

  const getCategory = (catId: string | null) =>
    categories.find(c => c.id === catId)

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.6
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setScrollStart(scrollRef.current?.scrollLeft || 0)
    if (scrollRef.current) scrollRef.current.style.scrollSnapType = "none"
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollRef.current) return
    const dx = e.clientX - startX
    scrollRef.current.scrollLeft = scrollStart - dx
  }

  const onPointerUp = () => {
    setIsDragging(false)
    if (scrollRef.current) scrollRef.current.style.scrollSnapType = "x mandatory"
    updateScrollButtons()
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-6 sm:mb-8">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            {lang === "en" ? "New arrivals" : "وصل حديثا"}
          </span>
          <h2 className="heading text-2xl sm:text-3xl md:text-4xl mt-1">
            {lang === "en" ? "Our Latest" : "أحدث المنتجات"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} disabled={!canScrollLeft}
            className="p-1.5 rounded-lg hidden sm:flex items-center justify-center transition-opacity" aria-label="Scroll left"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: canScrollLeft ? 1 : 0.3, cursor: canScrollLeft ? "pointer" : "default" }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll("right")} disabled={!canScrollRight}
            className="p-1.5 rounded-lg hidden sm:flex items-center justify-center transition-opacity" aria-label="Scroll right"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: canScrollRight ? 1 : 0.3, cursor: canScrollRight ? "pointer" : "default" }}>
            <ChevronRight size={16} />
          </button>
          <Link href="#products" className="text-sm font-medium whitespace-nowrap flex-shrink-0" style={{ color: "var(--accent)" }}>
            {lang === "en" ? "View All →" : "عرض الكل ←"}
          </Link>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-3 sm:px-4 pb-2 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollSnapType: "x mandatory", scrollBehavior: isDragging ? "auto" : "smooth", scrollPaddingLeft: "16px" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {latest.map(product => {
            const cat = getCategory(product.category_id)
            const name = lang === "en" ? product.name_en : product.name_ar
            const inCart = cartIds.has(product.id)

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[220px] sm:w-[260px] rounded-xl overflow-hidden transition-all duration-200 sm:hover:shadow-xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  scrollSnapAlign: "start",
                }}
              >
                <Link href={`/product/${product.id}`} className="block relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div className="aspect-square">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={name} fill className="object-cover transition-transform duration-500 sm:hover:scale-110" sizes="(max-width: 640px) 50vw, 260px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl" style={{ color: "var(--text-muted)" }}>
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider" style={{ background: "var(--accent)", color: "#fff" }}>
                    {lang === "en" ? "NEW" : "جديد"}
                  </span>
                  {product.weight && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-medium backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.9)" }}>
                      {product.weight}
                    </span>
                  )}
                </Link>
                <div className="p-3 space-y-1.5">
                  {cat && cat.id !== "all" && (
                    <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                      {lang === "en" ? cat.name_en : cat.name_ar}
                    </p>
                  )}
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-bold leading-snug line-clamp-2 hover:underline">{name}</h3>
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, quantity: 1, weight: product.weight, pieces_per_carton: product.pieces_per_carton })}
                      className="p-2 min-touch flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90"
                      style={{ background: inCart ? "var(--accent)" : "var(--surface-2)", color: inCart ? "#fff" : "var(--text-secondary)" }}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute right-0 top-0 bottom-2 w-16 pointer-events-none hidden sm:block"
          style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />
      </div>
    </section>
  )
}