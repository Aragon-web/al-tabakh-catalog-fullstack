"use client"

import { useStore } from "@/lib/store"
import { Package, Building2, Globe2, Award } from "lucide-react"
import { useSiteConfig } from "@/lib/theme-provider"

export function StatsBar() {
  const { lang, products, categories } = useStore()
  const { sections, content } = useSiteConfig()

  if (sections.stats_bar === false) return null

  const statsContent = (content.stats || {}) as { items_en?: { value: string; label: string }[]; items_ar?: { value: string; label: string }[] }

  const itemsEn = statsContent.items_en || [
    { value: "Since 1999", label: "Years of Excellence" },
    { value: `${products.length}+`, label: "Products" },
    { value: `${categories.filter(c => c.id !== "all").length}`, label: "Categories" },
    { value: "All Iraq", label: "Nationwide Delivery" },
  ]

  const itemsAr = statsContent.items_ar || [
    { value: "منذ ١٩٩٩", label: "سنوات من التميز" },
    { value: `${products.length}+`, label: "منتج" },
    { value: `${categories.filter(c => c.id !== "all").length}`, label: "قسم" },
    { value: "العراق", label: "توصيل لجميع أنحاء" },
  ]

  const items = lang === "en" ? itemsEn : itemsAr
  const icons = [Award, Package, Building2, Globe2]

  return (
    <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent" />
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-px">
        {items.map((item: { value: string; label: string }, i: number) => {
          const Icon = icons[i % icons.length]
          return (
            <div key={i} className="flex flex-col items-center justify-center p-6 sm:p-8 text-center" style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}>
              <Icon size={20} style={{ color: "var(--accent)" }} className="mb-2" />
              <span className="heading text-xl sm:text-2xl font-bold mb-1">{item.value}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}