"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { categorySlug } from "@/lib/slugify"
import Link from "next/link"
import Image from "next/image"

const gradients = [
  "from-[#D11D1D] to-[#ff6b6b]",
  "from-[#E93C3C] to-[#ff9a44]",
  "from-[#A51414] to-[#D11D1D]",
  "from-[#ff6b6b] to-[#ffd93d]",
  "from-[#D11D1D] to-[#A51414]",
  "from-[#ff9a44] to-[#ff6b6b]",
  "from-[#B81414] to-[#E93C3C]",
  "from-[#D11D1D] to-[#ff6b6b]",
  "from-[#E93C3C] to-[#ff9a44]",
  "from-[#A51414] to-[#D11D1D]",
  "from-[#ff6b6b] to-[#ffd93d]",
  "from-[#D11D1D] to-[#A51414]",
  "from-[#ff9a44] to-[#ff6b6b]",
  "from-[#B81414] to-[#E93C3C]",
  "from-[#D11D1D] to-[#ff6b6b]",
  "from-[#E93C3C] to-[#ff9a44]",
]

export function CategoryGrid() {
  const { lang, categories, products } = useStore()
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const visible = categories.filter(c => c.id !== "all")
  if (visible.length === 0) return null

  const catCount = (catId: string) => products.filter(p => p.category_id === catId).length

  return (
    <section>
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="heading text-2xl sm:text-3xl md:text-4xl mb-3">
          {lang === "en" ? "Our Categories" : "الأقسام"}
        </h2>
        <p className="text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
          {lang === "en"
            ? "Browse our complete range of premium products"
            : "تصفح جميع منتجاتنا المتميزة"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((cat, i) => {
          const showImg = cat.image_url && !failedImages.has(cat.id)
          const g = gradients[i % gradients.length]

          return (
            <Link
              key={cat.id}
              href={`/category/${categorySlug(cat)}`}
              className="group relative rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.97] sm:hover:scale-[1.03] sm:hover:shadow-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="aspect-[4/3] relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
                {showImg ? (
                  <Image
                    src={cat.image_url}
                    alt={lang === "en" ? cat.name_en : cat.name_ar}
                    fill
                    className="object-cover transition-transform duration-500 sm:group-hover:scale-110"
                    onError={() => setFailedImages(prev => new Set(prev).add(cat.id))}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${g} flex items-center justify-center`}>
                    <span className="text-white text-3xl sm:text-4xl font-bold opacity-40 heading">
                      {(lang === "en" ? cat.name_en : cat.name_ar).charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold truncate heading">
                  {lang === "en" ? cat.name_en : cat.name_ar}
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {catCount(cat.id)} {lang === "en" ? "products" : "منتج"}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
