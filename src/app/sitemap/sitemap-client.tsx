"use client"

import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { categorySlug } from "@/lib/slugify"
import Link from "next/link"

export function SitemapClient() {
  const { lang, products, categories } = useStore()
  const visible = categories.filter(c => c.id !== "all")

  const t = {
    en: {
      title: "Sitemap",
      subtitle: "Browse all categories and products",
      pages: "Pages",
      home: "Home",
      orders: "My Orders",
      cart: "Cart",
      faq: "FAQ",
      about: "About Us",
      loyalty: "Loyalty Program",
    },
    ar: {
      title: "خريطة الموقع",
      subtitle: "تصفح جميع الأقسام والمنتجات",
      pages: "الصفحات",
      home: "الرئيسية",
      orders: "طلباتي",
      cart: "السلة",
      faq: "الأسئلة الشائعة",
      about: "من نحن",
      loyalty: "برنامج الولاء",
    },
  }[lang]

  return (
    <> <Header /> <main style={{ background: "var(--bg)" }}>
      <div className="pt-20 sm:pt-24 pb-6" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="heading text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Static pages */}
        <section>
          <h2 className="heading text-lg font-bold mb-4" style={{ color: "var(--accent)" }}>{t.pages}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { href: "/", label: t.home },
              { href: "/orders", label: t.orders },
              { href: "/cart", label: t.cart },
              { href: "/faq", label: t.faq },
              { href: "/about", label: t.about },
              { href: "/loyalty", label: t.loyalty },
            ].map(page => (
              <Link key={page.href} href={page.href}
                className="px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {page.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="heading text-lg font-bold mb-4" style={{ color: "var(--accent)" }}>
            {lang === "en" ? "Categories" : "الأقسام"} ({visible.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {visible.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length
              return (
                <Link key={cat.id} href={`/category/${categorySlug(cat)}`}
                  className="px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between"
                  style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  <span>{lang === "en" ? cat.name_en : cat.name_ar}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{count}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Products */}
        <section>
          <h2 className="heading text-lg font-bold mb-4" style={{ color: "var(--accent)" }}>
            {lang === "en" ? "All Products" : "جميع المنتجات"} ({products.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {products.map(p => (
              <Link key={p.id} href={`/product/${p.id}`}
                className="px-3 py-2 rounded-lg text-xs transition-colors truncate"
                style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {lang === "en" ? p.name_en : p.name_ar}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main> <Footer /> </>
  )
}

