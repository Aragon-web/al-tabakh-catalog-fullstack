"use client"

import { useRef, useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CategoryCarousel() {
  const { lang, categories, selectedCategory, setSelectedCategory, products } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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
    const amount = el.clientWidth * 0.6
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  const visible = categories.filter(c => c.id !== "all")
  if (visible.length === 0) return null

  const catProducts = (catId: string) => products.filter(p => p.category_id === catId).length

  const catLang = (cat: typeof visible[0]) => lang === "en" ? cat.name_en : cat.name_ar

  return (
    <section className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full shadow-lg hidden sm:flex items-center justify-center"
          style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full shadow-lg hidden sm:flex items-center justify-center"
          style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-1 px-0.5"
        style={{ scrollSnapType: "x proximity" }}
      >
        <button
          onClick={() => setSelectedCategory("all")}
          className="flex flex-col items-center justify-center gap-1 px-5 py-3 rounded-xl flex-shrink-0 transition-all duration-150 active:scale-95"
          style={{
            background: selectedCategory === "all" ? "var(--accent)" : "var(--surface)",
            border: "1px solid",
            borderColor: selectedCategory === "all" ? "var(--accent)" : "var(--border)",
            color: selectedCategory === "all" ? "#fff" : "var(--text-secondary)",
            minWidth: "100px",
            scrollSnapAlign: "start",
          }}
        >
          <span className="text-xs font-medium whitespace-nowrap">
            {lang === "en" ? "All" : "الكل"}
          </span>
          <span className="text-[10px] opacity-70">{products.length}</span>
        </button>
        {visible.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="flex flex-col items-center justify-center gap-1 px-5 py-3 rounded-xl flex-shrink-0 transition-all duration-150 active:scale-95"
            style={{
              background: selectedCategory === cat.id ? "var(--accent)" : "var(--surface)",
              border: "1px solid",
              borderColor: selectedCategory === cat.id ? "var(--accent)" : "var(--border)",
              color: selectedCategory === cat.id ? "#fff" : "var(--text-secondary)",
              minWidth: "100px",
              scrollSnapAlign: "start",
            }}
          >
            <span className="text-xs font-medium truncate max-w-[100px]">
              {catLang(cat)}
            </span>
            <span className="text-[10px] opacity-70">{catProducts(cat.id)}</span>
          </button>
        ))}
      </div>

      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none hidden sm:block"
          style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />
      )}
    </section>
  )
}
