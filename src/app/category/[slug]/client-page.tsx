"use client"

import { useCallback, useEffect, useMemo, useState, Suspense } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "@/components/Pagination"
import { useStore } from "@/lib/store"
import { slugify } from "@/lib/slugify"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PER_PAGE } from "@/lib/constants"

function ProductGrid({ filtered }: { filtered: import("@/lib/types").Product[] }) {
  const { lang } = useStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginatedProducts = useMemo(
    () => filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [filtered, safePage]
  )

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p <= 1) params.delete("page")
    else params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {paginatedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <p className="text-sm sm:text-lg">{lang === "en" ? "No products in this category" : "لا توجد منتجات في هذا القسم"}</p>
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} lang={lang} />
    </>
  )
}

export function CategoryClient({ slug }: { slug: string }) {
  const { lang, categories, products, setSelectedCategory } = useStore()
  const [failedImg, setFailedImg] = useState(false)

  const findCategory = useCallback(
    () => categories.find(c => c.id === slug) || categories.find(c => slugify(c.name_en) === slug),
    [categories, slug]
  )

  const category = useMemo(() => findCategory(), [findCategory])

  useEffect(() => {
    if (category) setSelectedCategory(category.id)
  }, [category, setSelectedCategory])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const catId = category?.id
  const filtered = useMemo(
    () => (catId ? products.filter(p => p.category_id === catId) : []),
    [products, catId]
  )

  if (!category) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8 text-center">
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            {lang === "en" ? "Category not found" : "القسم غير موجود"}
          </p>
          <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
            {lang === "en" ? "Back to Home" : "العودة إلى الرئيسية"}
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const name = lang === "en" ? category.name_en : category.name_ar
  const showImg = category.image_url && !failedImg

  const gradients = [
    "from-[#D11D1D] to-[#ff6b6b]",
  ]

  return (
    <>
      {<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name,
        description: `${filtered.length} products in ${name}`,
        url: `https://al-tabakh-v3.vercel.app/category/${slug}`,
      }) }} />}
      <Header />
      <main className="flex-1 pb-8">
        <div className="relative h-[200px] sm:h-[280px] overflow-hidden" style={{ background: "var(--surface)" }}>
          {showImg ? (
            <Image
              src={category.image_url}
              alt={name}
              fill
              className="object-cover"
              onError={() => setFailedImg(true)}
              sizes="100vw"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradients[0]} flex items-center justify-center`}>
              <span className="text-white text-6xl sm:text-8xl font-bold opacity-20 heading">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm mb-2" style={{ color: "var(--text-muted)" }}>
              <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
              <span>/</span>
              <span style={{ color: "var(--text-secondary)" }}>{name}</span>
            </div>
            <h1 className="heading text-2xl sm:text-4xl font-bold">{name}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {filtered.length} {lang === "en" ? "products" : "منتج"}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-4 sm:mb-6 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={14} />
            {lang === "en" ? "Back to All Products" : "العودة إلى جميع المنتجات"}
          </Link>

          <Suspense fallback={null}>
            <ProductGrid filtered={filtered} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
