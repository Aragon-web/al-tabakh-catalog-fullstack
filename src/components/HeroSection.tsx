"use client"

import { useStore } from "@/lib/store"
import { ChevronDown } from "lucide-react"
import { useSiteConfig } from "@/lib/theme-provider"
import dynamic from "next/dynamic"

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: "var(--surface)" }} />,
})

export function HeroSection() {
  const { lang } = useStore()
  const { sections, content } = useSiteConfig()

  if (sections.hero === false) return null

  const hero = (content.hero || {}) as Record<string, string | undefined>

  const t = {
    en: {
      title: String(hero.title_en || "Premium Food\nProducts"),
      subtitle: String(hero.subtitle_en || "Quality ingredients from Malek Al-Tabakh Company — bringing authentic flavors to every kitchen since 1999."),
      cta: String(hero.cta_en || "Discover Products"),
      scroll: "Scroll",
    },
    ar: {
      title: String(hero.title_ar || "منتجات غذائية\nفاخرة"),
      subtitle: String(hero.subtitle_ar || "مكونات عالية الجودة من شركة مالك الطباخ — نكهات أصيلة لكل مطبخ منذ ١٩٩٩."),
      cta: String(hero.cta_ar || "تصفح المنتجات"),
      scroll: "اسفل",
    },
  }[lang]

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/wW0d7bhHm4kwnkej/scene.splinecode" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-36">
        <div className="flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 bg-white/15 text-white/90 tracking-wide uppercase">
            {lang === "en" ? "Malek Al-Tabakh Co." : "شركة مالك الطباخ"}
          </span>
          <h1 className="heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-6">
            {t.title.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            {t.subtitle}
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#A51414] font-bold text-sm sm:text-base hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            {t.cta}
            <ChevronDown size={18} />
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </section>
  )
}
