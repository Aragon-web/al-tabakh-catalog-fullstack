"use client"

import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { LatestProducts } from "@/components/LatestProducts"
import { CategoryGrid } from "@/components/CategoryGrid"
import { BrandStory } from "@/components/BrandStory"
import { StatsBar } from "@/components/StatsBar"
import { OrderTracker } from "@/components/OrderTracker"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "@/components/Pagination"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { useSiteConfig } from "@/lib/theme-provider"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useMemo, Suspense } from "react"
import { PER_PAGE } from "@/lib/constants"

function ProductGrid() {
  const { filteredProducts, lang, products } = useStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [filteredProducts, safePage]
  )

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p <= 1) params.delete("page")
    else params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const t = {
    en: { products: "All Products", count: (n: number) => `${n} of ${products.length} products` },
    ar: { products: "جميع المنتجات", count: (n: number) => `${n} من ${products.length} منتج` },
  }[lang]

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="heading text-2xl sm:text-3xl md:text-4xl">{t.products}</h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {t.count(filteredProducts.length)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {paginatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm sm:text-lg">{lang === "en" ? "No products found" : "لا توجد منتجات"}</p>
          </div>
        )}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} lang={lang} />
    </>
  )
}

export function ClientPage() {
  const { sections, whatsapp } = useSiteConfig()
  const phone = whatsapp.numbers[0]?.phone || whatsapp.orderTarget

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Malek Al-Tabakh Company",
    url: "https://al-tabakh-v3.vercel.app",
    logo: "https://al-tabakh-v3.vercel.app/favicon.svg",
    description: "Premium food products supplier since 1999",
    address: { "@type": "PostalAddress", addressLocality: "Iraq" },
    contactPoint: { "@type": "ContactPoint", telephone: phone, contactType: "customer service" },
  }

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://al-tabakh-v3.vercel.app",
    name: "Al-Tabakh Premium Catalog",
    inLanguage: ["ar", "en"],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      <Header />
      {sections.hero !== false && <HeroSection />}

      <main className="flex-1">
        {sections.latest_products !== false && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-10 sm:mt-14">
            <LatestProducts />
          </div>
        )}

        {sections.category_grid !== false && (
          <>
            <div className="wave-divider max-w-7xl mx-auto" />
            <section className="section-alt py-10 sm:py-14">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <CategoryGrid />
              </div>
            </section>
          </>
        )}

        {sections.stats_bar !== false && (
          <>
            <div className="wave-divider max-w-7xl mx-auto" />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-10 sm:mt-14">
              <StatsBar />
            </div>
          </>
        )}

        {sections.brand_story !== false && (
          <>
            <div className="wave-divider max-w-7xl mx-auto" />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-10 sm:mt-14">
              <BrandStory />
            </div>
          </>
        )}

        {sections.order_tracker !== false && (
          <>
            <div className="wave-divider max-w-7xl mx-auto" />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-10 sm:mt-14">
              <OrderTracker />
            </div>
          </>
        )}

        <div className="wave-divider max-w-7xl mx-auto" />

        <section id="products" className="mt-10 sm:mt-14 pb-16">
          <Suspense fallback={null}>
            <ProductGrid />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  )
}