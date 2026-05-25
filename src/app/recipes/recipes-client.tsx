"use client"

import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PageTransition } from "@/components/PageTransition"
import { Home, Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Recipe } from "@/lib/types"

export function RecipesClient({ recipes }: { recipes: Recipe[] }) {
  const { lang } = useStore()
  const t = {
    en: { title: "Recipes & Blog", subtitle: "Cooking tips, stories, and inspiration from Al-Tabakh", readMore: "Read More", by: "By", noRecipes: "No recipes yet. Check back soon!" },
    ar: { title: "الوصفات والمدونة", subtitle: "نصائح طبخ، قصص، وإلهام من الطباخ", readMore: "اقرأ المزيد", by: "بواسطة", noRecipes: "لا توجد وصفات بعد. ترقبوا الجديد!" },
  }[lang]

  return (
    <PageTransition>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        <div className="pt-20 sm:pt-24 pb-6" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
              <span>/</span>
              <span style={{ color: "var(--text-secondary)" }}>{t.title}</span>
            </nav>
            <h1 className="heading text-2xl sm:text-3xl font-bold mb-2 text-center">{t.title}</h1>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          {recipes.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>{t.noRecipes}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recipes.map(r => (
                <Link key={r.id} href={`/recipes/${r.slug}`} className="group rounded-xl overflow-hidden transition-all hover:-translate-y-1" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  {r.image_url ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={r.image_url} alt={lang === "en" ? r.title_en : r.title_ar} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                      <span className="text-3xl">🍽</span>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h2 className="font-semibold text-sm sm:text-base line-clamp-2">{lang === "en" ? r.title_en : r.title_ar}</h2>
                    {(lang === "en" ? r.excerpt_en : r.excerpt_ar) && (
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{lang === "en" ? r.excerpt_en : r.excerpt_ar}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {r.author && <span className="flex items-center gap-1"><User size={11} />{r.author}</span>}
                        <span className="flex items-center gap-1"><Calendar size={11} />{new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
