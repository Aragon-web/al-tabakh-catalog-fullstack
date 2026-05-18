"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    en: { title: "Premium Food Products", subtitle: "Quality ingredients for every kitchen" },
    ar: { title: "منتجات غذائية فاخرة", subtitle: "مكونات عالية الجودة لكل مطبخ" },
    gradient: "from-[#D11D1D] to-[#ff6b6b]",
  },
  {
    en: { title: "Spices & Sauces", subtitle: "Authentic flavors from around the world" },
    ar: { title: "بهارات وصلصات", subtitle: "نكهات أصيلة من جميع أنحاء العالم" },
    gradient: "from-[#E93C3C] to-[#ff9a44]",
  },
  {
    en: { title: "Wholesale Available", subtitle: "Contact us for bulk orders" },
    ar: { title: "الجملة متاحة", subtitle: "اتصل بنا للطلبات بالجملة" },
    gradient: "from-[#A51414] to-[#D11D1D]",
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [lang, setLang] = useState<"en" | "ar">("ar")

  useEffect(() => {
    const saved = localStorage.getItem("altabakh_lang") as "en" | "ar" | null
    if (saved) setLang(saved)
    const listener = () => {
      const l = localStorage.getItem("altabakh_lang") as "en" | "ar" | null
      if (l) setLang(l)
    }
    window.addEventListener("storage", listener)
    return () => window.removeEventListener("storage", listener)
  }, [])

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mt-16">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`} />
      <div className="absolute inset-0" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 animate-fade-in" key={current}>
          {lang === "en" ? slide.en.title : slide.ar.title}
        </h1>
        <p className="text-lg md:text-xl text-white/80 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {lang === "en" ? slide.en.subtitle : slide.ar.subtitle}
        </p>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  )
}
