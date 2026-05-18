"use client"

import { Header } from "@/components/Header"
import { HeroCarousel } from "@/components/HeroCarousel"
import { ProductCard } from "@/components/ProductCard"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"

export function ClientPage() {
  const { filteredProducts, lang, products } = useStore()

  const t = {
    en: { products: "Products", count: (n: number) => `${n} of ${products.length} products` },
    ar: { products: "المنتجات", count: (n: number) => `${n} من ${products.length} منتج` },
  }[lang]

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 pt-2">
        <HeroCarousel />

        <section className="mt-4 sm:mt-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-xl font-bold">{t.products}</h2>
            <span className="text-[10px] sm:text-sm" style={{ color: "var(--text-muted)" }}>
              {t.count(filteredProducts.length)}
            </span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
              <p className="text-sm sm:text-lg">{lang === "en" ? "No products found" : "لا توجد منتجات"}</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
