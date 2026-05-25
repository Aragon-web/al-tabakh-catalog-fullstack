"use client"

import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Home } from "lucide-react"
import Link from "next/link"

export function AboutClient() {
  const { lang, products, categories } = useStore()
  const t = {
    en: {
      title: "Our Story",
      subtitle: "A legacy of authentic flavors since 1999",
      missionTitle: "Our Mission",
      mission: "To provide Iraqi families and businesses with the highest quality food products, spices, and ingredients — bridging tradition and quality in every package.",
      visionTitle: "Our Vision",
      vision: "To be Iraq's most trusted food supply partner, known for authenticity, reliability, and excellence across every product we offer.",
      years: "Years of Excellence",
      products: "Products",
      categories: "Categories",
      cities: "Cities Served",
      values: "Our Values",
      valuesList: [
        { title: "Quality First", desc: "Every product is carefully sourced and tested to meet our strict quality standards before reaching your kitchen." },
        { title: "Authentic Flavors", desc: "We preserve traditional Iraqi and regional tastes, bringing genuine culinary heritage to every dish." },
        { title: "Customer Trust", desc: "Since 1999, our customers have relied on us for consistent quality, fair pricing, and reliable delivery." },
        { title: "Wide Selection", desc: `With over ${products.length} products across ${categories.length} categories, we offer everything from essential spices to specialty baking supplies.` },
      ],
      timelineTitle: "Our Journey",
      timeline: [
        { year: "1999", event: "Malek Al-Tabakh Company founded, starting with a commitment to premium quality food products." },
        { year: "2005", event: "Expanded product line to include baking supplies, sweets powders, and pastry ingredients." },
        { year: "2012", event: "Launched wholesale distribution to restaurants, hotels, and supermarkets across Iraq." },
        { year: "2020", event: "Introduced new packaging designs and expanded to over 400 unique product SKUs." },
        { year: "2024", event: "Digital transformation — launched our online catalog to serve customers across all Iraqi governorates." },
      ],
    },
    ar: {
      title: "قصتنا",
      subtitle: "إرث من النكهات الأصيلة منذ ١٩٩٩",
      missionTitle: "مهمتنا",
      mission: "تزويد العائلات والشركات العراقية بأعلى جودة من المنتجات الغذائية والبهارات والمكونات — نربط بين التقاليد والجودة في كل عبوة.",
      visionTitle: "رؤيتنا",
      vision: "أن نكون شريك التوريد الغذائي الأكثر ثقة في العراق، والمعروف بالأصالة والموثوقية والتميز في كل منتج نقدمه.",
      years: "سنوات من التميز",
      products: "منتج",
      categories: "قسم",
      cities: "محافظة مخدومة",
      values: "قيمنا",
      valuesList: [
        { title: "الجودة أولاً", desc: "يتم اختيار واختبار كل منتج بعناية ليلبي معايير الجودة الصارمة قبل وصوله إلى مطبخك." },
        { title: "نكهات أصيلة", desc: "نحافظ على المذاق العراقي والإقليمي الأصيل، ونقدم تراثاً طبخياً حقيقياً في كل طبق." },
        { title: "ثقة العملاء", desc: "منذ ١٩٩٩، يعتمد علينا عملاؤنا للحصول على جودة ثابتة وأسعار عادلة وتوصيل موثوق." },
        { title: "تشكيلة واسعة", desc: `مع أكثر من ${products.length} منتج عبر ${categories.length} قسماً، نقدم كل شيء من البهارات الأساسية إلى مستلزمات الخبز المتخصصة.` },
      ],
      timelineTitle: "رحلتنا",
      timeline: [
        { year: "١٩٩٩", event: "تأسست شركة مالك الطباخ، بدأت بالالتزام بتقديم منتجات غذائية عالية الجودة." },
        { year: "٢٠٠٥", event: "توسع خط الإنتاج ليشمل مستلزمات الخبز ومساحيق الحلويات ومكونات المعجنات." },
        { year: "٢٠١٢", event: "إطلاق التوزيع بالجملة للمطاعم والفنادق والسوبرماركت في جميع أنحاء العراق." },
        { year: "٢٠٢٠", event: "إدخال تصاميم تغليف جديدة وتوسيع التشكيلة لأكثر من ٤٠٠ منتج." },
        { year: "٢٠٢٤", event: "التحول الرقمي — إطلاق الكتالوج الإلكتروني لخدمة العملاء في جميع المحافظات العراقية." },
      ],
    },
  }[lang]

  return (
    <> <Header /> <main style={{ background: "var(--bg)" }}>
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
          <span>/</span>
          <span style={{ color: "var(--text-secondary)" }}>{t.title}</span>
        </nav>
      </div>
      {/* Hero */}
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="heading text-3xl sm:text-4xl font-bold mb-3">{t.title}</h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 rounded-2xl shadow-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {[
            ["27", t.years],
            [`${products.length}+`, t.products],
            [`${categories.length}`, t.categories],
            ["18+", t.cities],
          ].map(([num, label]) => (
            <div key={num} className="text-center">
              <p className="heading text-2xl sm:text-3xl font-bold" style={{ color: "var(--accent)" }}>{num}</p>
              <p className="text-[11px] sm:text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-5 sm:p-6 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="heading text-lg font-bold mb-2" style={{ color: "var(--accent)" }}>{t.missionTitle}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t.mission}</p>
          </div>
          <div className="p-5 sm:p-6 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="heading text-lg font-bold mb-2" style={{ color: "var(--accent)" }}>{t.visionTitle}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t.vision}</p>
          </div>
        </div>
      </div>

      <div className="wave-divider" />

      {/* Values */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="heading text-xl sm:text-2xl font-bold text-center mb-8">{t.values}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {t.valuesList.map((v, i) => (
            <div key={i} className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold mb-3" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                0{i + 1}
              </div>
              <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="wave-divider" />

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="heading text-xl sm:text-2xl font-bold text-center mb-8">{t.timelineTitle}</h2>
        <div className="space-y-0">
          {t.timeline.map((item, i) => (
            <div key={i} className="flex gap-4 sm:gap-6 pb-6 relative">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--accent)" }} />
                {i < t.timeline.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ background: "var(--border)" }} />
                )}
              </div>
              <div className="flex-1 pb-2">
                <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{item.year}</span>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main> <Footer /> </>
  )
}

