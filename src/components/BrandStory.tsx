"use client"

import { useStore } from "@/lib/store"
import { useSiteConfig } from "@/lib/theme-provider"

export function BrandStory() {
  const { lang } = useStore()
  const { sections, content } = useSiteConfig()

  if (sections.brand_story === false) return null

  const story = (content.brand_story || {}) as Record<string, string | undefined>

  const defaultEn = "Since 1999, Malek Al-Tabakh Company has been Iraq's trusted name in premium food products. What began as a commitment to quality has grown into a catalog of over 480 products — from aromatic spices and herb blends to sauces, syrups, baking essentials, and specialty ingredients.\n\nEvery product reflects our dedication to authentic taste, consistent quality, and the culinary heritage of the region. We partner with local producers and international suppliers to bring the finest ingredients to kitchens across Iraq."

  const defaultAr = "منذ عام ١٩٩٩، شركة مالك الطباخ هي اسم موثوق في مجال المنتجات الغذائية المتميزة في العراق. ما بدأ كالتزام بالجودة نما ليصبح كتالوج يضم أكثر من ٤٨٠ منتج — من البهارات العطرية وخلطات الأعشاب إلى الصلصات والشراب ومستلزمات الخبز والمكونات المتخصصة.\n\nكل منتج يعكس تفانينا في تقديم طعم أصيل وجودة ثابتة وتراث الطهي في المنطقة. نتعاون مع المنتجين المحليين والموردين الدوليين لتقديم أفضل المكونات إلى المطابخ في جميع أنحاء العراق."

  const t = {
    en: {
      tag: String(story.tag_en || "Our Story"),
      title: String(story.title_en || "A Legacy of\nFine Flavors"),
      body: String(story.body_en || defaultEn),
      cta: String(story.cta_en || "Browse All Products"),
    },
    ar: {
      tag: String(story.tag_ar || "قصتنا"),
      title: String(story.title_ar || "إرث من\nالنكهات الأصيلة"),
      body: String(story.body_ar || defaultAr),
      cta: String(story.cta_ar || "تصفح جميع المنتجات"),
    },
  }[lang]

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center order-2 md:order-1">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ background: "var(--accent)", color: "#fff" }}>
            {t.tag}
          </span>
          <h2 className="heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.15] mb-5">
            {t.title.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}
          </h2>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {t.body.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <a
            href="#products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full text-sm font-bold transition-all active:scale-95 self-start"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {t.cta}
          </a>
        </div>
        <div className="relative min-h-[280px] sm:min-h-[400px] order-1 md:order-2 overflow-hidden rounded-t-2xl md:rounded-l-none md:rounded-r-3xl" style={{ background: "var(--surface-2)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#A51414] to-[#D11D1D] opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="block heading text-7xl sm:text-8xl md:text-9xl font-bold opacity-10" style={{ color: "var(--accent)" }}>
                {lang === "en" ? "AT" : "مط"}
              </span>
              <p className="text-sm mt-2 opacity-30" style={{ color: "var(--text-primary)" }}>
                {lang === "en" ? "Since 1999" : "منذ ١٩٩٩"}
              </p>
            </div>
          </div>
          <div className="absolute inset-0" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
      </div>
    </section>
  )
}