"use client"

import { MessageCircle } from "lucide-react"
import { useSiteConfig } from "@/lib/theme-provider"
import { usePathname } from "next/navigation"

export function WhatsAppButton() {
  const { sections, whatsapp } = useSiteConfig()
  const pathname = usePathname()

  if (sections.whatsapp_button === false) return null
  if (pathname.startsWith("/admin")) return null

  const phone = whatsapp.numbers[0]?.phone || whatsapp.orderTarget
  if (!phone) return null

  return (
    <a
      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex items-center gap-2 px-3 sm:px-4 h-12 sm:h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 animate-bounce-in"
      style={{
        background: "var(--wa)",
        color: "#fff",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        insetInlineEnd: "16px",
      }}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={22} className="sm:w-[26px] sm:h-[26px]" />
      <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">WhatsApp</span>
    </a>
  )
}
