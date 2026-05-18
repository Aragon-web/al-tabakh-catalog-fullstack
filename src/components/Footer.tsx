"use client"

import { useStore } from "@/lib/store"
import { Phone, MapPin } from "lucide-react"

export function Footer() {
  const { lang } = useStore()

  const t = {
    en: { phone: "+964 773 331 0100", rights: "All rights reserved." },
    ar: { phone: "٠٠٩٦٤ ٧٧٣ ٣٣١ ٠١٠٠", rights: "جميع الحقوق محفوظة." },
  }[lang]

  return (
    <footer className="mt-16 py-8 px-4" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
          <Phone size={14} />
          <span className="text-sm">{t.phone}</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Al-Tabakh. {t.rights}
        </p>
      </div>
    </footer>
  )
}
