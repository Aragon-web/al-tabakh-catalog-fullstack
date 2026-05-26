"use client"

import { useMemo, useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ProductCard } from "@/components/ProductCard"
import { Tag, Percent, Home } from "lucide-react"
import Link from "next/link"

const DEFAULTS = {
  en: { title: "Special Offers", subtitle: "Discounted products available for a limited time", empty: "No active campaigns right now. Check back soon!" },
  ar: { title: "العروض الخاصة", subtitle: "منتجات مخفضة متاحة لفترة محدودة", empty: "لا توجد عروض نشطة حالياً. ترقبوا الجديد!" },
}

export function CampaignClient() {
  const { lang, products } = useStore()
  const featuredProducts = useMemo(() => products.filter(p => p.is_featured), [products])
  const [campaign, setCampaign] = useState<{ titleEn: string; titleAr: string; subtitleEn: string; subtitleAr: string; emptyEn: string; emptyAr: string; bannerUrl: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.ok ? r.json() : [])
      .then(all => {
        const s = (Array.isArray(all) ? all : []).find((x: { key: string }) => x.key === "campaign")
        if (s?.value) setCampaign(s.value)
      })
      .catch(() => {})
  }, [])

  const t = campaign
    ? {
        en: { title: campaign.titleEn || DEFAULTS.en.title, subtitle: campaign.subtitleEn || DEFAULTS.en.subtitle, empty: campaign.emptyEn || DEFAULTS.en.empty },
        ar: { title: campaign.titleAr || DEFAULTS.ar.title, subtitle: campaign.subtitleAr || DEFAULTS.ar.subtitle, empty: campaign.emptyAr || DEFAULTS.ar.empty },
      }[lang]
    : DEFAULTS[lang]

  return (
    <>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        <div className="pt-20 sm:pt-24 pb-6" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
              <span>/</span>
              <span style={{ color: "var(--text-secondary)" }}>{t.title}</span>
            </nav>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Percent size={22} style={{ color: "var(--wa)" }} />
              <Tag size={22} style={{ color: "var(--accent)" }} />
            </div>
            {campaign?.bannerUrl && (
              <img src={campaign.bannerUrl} alt="Campaign" className="w-full max-h-48 object-cover rounded-xl mb-4" />
            )}
            <h1 className="heading text-2xl sm:text-3xl font-bold mb-2 text-center">{t.title}</h1>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
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