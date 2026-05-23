"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ProductCard } from "@/components/ProductCard"
import { Tag, Percent } from "lucide-react"

export function CampaignClient() {
  const { lang, products } = useStore()
  const featuredProducts = useMemo(() => products.filter(p => p.is_featured), [products])

  const t = {
    en: { title: "Special Offers", subtitle: "Discounted products available for a limited time", empty: "No active campaigns right now. Check back soon!" },
    ar: { title: "العروض الخاصة", subtitle: "منتجات مخفضة متاحة لفترة محدودة", empty: "لا توجد عروض نشطة حالياً. ترقبوا الجديد!" },
  }[lang]

  return (
    <>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        <div className="pt-20 sm:pt-24 pb-6" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Percent size={22} style={{ color: "var(--wa)" }} />
              <Tag size={22} style={{ color: "var(--accent)" }} />
            </div>
            <h1 className="heading text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          {featuredProducts.length === 0 ? (
            <p className="text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}