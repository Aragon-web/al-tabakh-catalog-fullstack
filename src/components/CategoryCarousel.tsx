"use client"

import { useRef, useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { ChevronLeft, ChevronRight } from "lucide-react"

const gradients = [
  "from-[#D11D1D] to-[#ff6b6b]",
  "from-[#E93C3C] to-[#ff9a44]",
  "from-[#A51414] to-[#D11D1D]",
  "from-[#ff6b6b] to-[#ffd93d]",
  "from-[#D11D1D] to-[#A51414]",
  "from-[#ff9a44] to-[#ff6b6b]",
]

export function CategoryCarousel() {
  const { lang, categories, selectedCategory, setSelectedCategory, products } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll)
    return () => el.removeEventListener("scroll", checkScroll)
  }, [categories])

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" })
  }

  const visible = categories.filter(c => c.id !== "all")
  if (visible.length === 0) return null

  const catImage = (catId: string) => {
    if (failedImages.has(catId)) return ""
    const p = products.find(pr => pr.category_id === catId && pr.image_url)
    return p?.image_url || ""
  }

  const catCount = (catId: string) => products.filter(p => p.category_id === catId).length
  const t = (e: string, a: string) => lang === "en" ? e : a

  const Card = ({ id, name, count, isAll }: { id: string; name: string; count: number; isAll: boolean }) => {
    const active = selectedCategory === id
    const img = isAll ? "" : catImage(id)
    const g = gradients[isAll ? 0 : visible.findIndex(c => c.id === id) % gradients.length]

    return (
      <button
        onClick={() => setSelectedCategory(id)}
        className="flex-shrink-0 rounded-xl overflow-hidden transition-all duration-150 active:scale-95"
        style={{
          width: 140,
          scrollSnapAlign: "start",
          border: "2px solid",
          borderColor: active ? "var(--accent)" : "var(--border)",
        }}
      >
        <div className="aspect-[4/3] relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
          {img ? (
            <img
              src={img}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setFailedImages(prev => new Set(prev).add(id))}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${g} flex items-center justify-center`}>
              <span className="text-white text-2xl font-bold opacity-50">
                {name.charAt(0)}
              </span>
            </div>
          )}
          {active && <div className="absolute inset-0" style={{ background: "rgba(209,29,29,0.2)" }} />}
        </div>
        <div className="px-2.5 py-2 text-left" style={{ background: active ? "var(--accent)" : "var(--surface)" }}>
          <p className="text-xs font-medium truncate" style={{ color: active ? "#fff" : "var(--text-primary)" }}>
            {name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
            {count} {t("items", "منتج")}
          </p>
        </div>
      </button>
    )
  }

  return (
    <section className="relative">
      {canScrollLeft && (
        <button onClick={() => scroll("left")}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full shadow-lg hidden sm:flex items-center justify-center"
          style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll("right")}
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full shadow-lg hidden sm:flex items-center justify-center"
          style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
          <ChevronRight size={20} />
        </button>
      )}

      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth py-1"
        style={{ scrollSnapType: "x proximity" }}>
        <Card id="all" name={t("All Products", "جميع المنتجات")} count={products.length} isAll />
        {visible.map(c => (
          <Card key={c.id} id={c.id} name={t(c.name_en, c.name_ar)} count={catCount(c.id)} isAll={false} />
        ))}
      </div>

      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none hidden sm:block"
          style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />
      )}
    </section>
  )
}
