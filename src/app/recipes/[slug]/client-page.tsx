"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PageTransition } from "@/components/PageTransition"
import { Home, Calendar, User, ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import type { Recipe, Product } from "@/lib/types"

export function RecipeDetailClient({ recipe }: { recipe: Recipe | null }) {
  const { lang, addToCart, cart } = useStore()
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    if (!recipe) return
    let ids: string[] = []
    try {
      const obj = JSON.parse(recipe.content_en)
      if (Array.isArray(obj.relatedProductIds)) ids = obj.relatedProductIds
    } catch {}
    if (ids.length === 0) return
    setLoadingRelated(true) // eslint-disable-line react-hooks/set-state-in-effect
    fetch("/api/products").then(r => r.json()).then((all: Product[]) => {
      setRelatedProducts(all.filter(p => ids.includes(p.id)))
    }).catch(() => {}).finally(() => setLoadingRelated(false))
  }, [recipe])

  if (!recipe) {
    return (
      <PageTransition>
        <Header />
        <main className="flex-1 flex items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Recipe not found" : "الوصفة غير موجودة"}</p>
            <Link href="/recipes" className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>{lang === "en" ? "Back to Recipes" : "العودة إلى الوصفات"}</Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  const title = lang === "en" ? recipe.title_en : recipe.title_ar
  const content = lang === "en" ? recipe.content_en : recipe.content_ar
  const excerpt = lang === "en" ? recipe.excerpt_en : recipe.excerpt_ar

  return (
    <PageTransition>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        {recipe.image_url && (
          <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden">
            <img src={recipe.image_url} alt={title} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
            <span>/</span>
            <Link href="/recipes" className="hover:underline">{lang === "en" ? "Recipes" : "الوصفات"}</Link>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{title}</span>
          </nav>

          <h1 className="heading text-2xl sm:text-3xl font-bold mb-3">{title}</h1>

          <div className="flex items-center gap-4 text-xs sm:text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {recipe.author && <span className="flex items-center gap-1"><User size={13} />{recipe.author}</span>}
            <span className="flex items-center gap-1"><Calendar size={13} />{new Date(recipe.created_at).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>

          {excerpt && (
            <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>{excerpt}</p>
          )}

          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} style={{ color: "var(--text-primary)", lineHeight: 1.8 }} />

          {(relatedProducts.length > 0 || loadingRelated) && (
            <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full" style={{ background: "var(--accent)" }} />
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{lang === "en" ? "Shop Ingredients" : "اشترِ المكونات"}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{relatedProducts.length} {lang === "en" ? "items" : "منتجات"}</span>
              </div>
              {loadingRelated && relatedProducts.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="aspect-[4/3]" style={{ background: "var(--surface-2)" }} />
                      <div className="p-3 space-y-2">
                        <div className="h-3 rounded" style={{ background: "var(--surface-2)" }} />
                        <div className="h-2 w-1/2 rounded" style={{ background: "var(--surface-2)" }} />
                        <div className="h-8 rounded-lg" style={{ background: "var(--surface-2)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedProducts.map(p => {
                  const inCart = cart.some(c => c.product_id === p.id)
                  return (
                    <div key={p.id}
                      className="group rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <Link href={`/product/${p.id}`} className="block aspect-[4/3] overflow-hidden" style={{ background: "var(--surface-2)" }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={lang === "en" ? p.name_en : p.name_ar} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                            {lang === "en" ? "No Image" : "لا توجد صورة"}
                          </div>
                        )}
                      </Link>
                      <div className="p-3 space-y-2">
                        <Link href={`/product/${p.id}`}>
                          <h4 className="text-xs font-semibold leading-snug line-clamp-2 hover:underline" style={{ color: "var(--text-primary)" }}>
                            {lang === "en" ? p.name_en : p.name_ar}
                          </h4>
                        </Link>
                        {p.weight && (
                          <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{p.weight}</p>
                        )}
                        <button
                          onClick={() => addToCart({ product_id: p.id, name_en: p.name_en, name_ar: p.name_ar, quantity: 1, weight: p.weight, pieces_per_carton: p.pieces_per_carton })}
                          className="w-full py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
                          style={{
                            background: inCart ? "var(--accent)" : "var(--surface-2)",
                            color: inCart ? "#fff" : "var(--text-secondary)",
                            boxShadow: inCart ? "none" : "none",
                          }}
                        >
                          <ShoppingCart size={13} className={inCart ? "fill-current" : ""} />
                          {inCart ? (lang === "en" ? "Added ✓" : "أضيف ✓") : (lang === "en" ? "Add to Cart" : "أضف للسلة")}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/recipes" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
              <ArrowLeft size={14} />{lang === "en" ? "Back to Recipes" : "العودة إلى الوصفات"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
