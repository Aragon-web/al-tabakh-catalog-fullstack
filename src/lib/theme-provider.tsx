"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"

const BASE_PALETTES = {
  dark: {
    bg: "#0D0D12",
    surface: "#16161E",
    "surface-2": "#1E1E2A",
    "surface-3": "#262635",
    navbar: "rgba(22, 22, 30, 0.85)",
    "text-primary": "#F0F0F5",
    "text-secondary": "rgba(240, 240, 245, 0.70)",
    "text-muted": "rgba(240, 240, 245, 0.58)",
    border: "rgba(255, 255, 255, 0.08)",
  },
  light: {
    bg: "#F5F5F7",
    surface: "#FFFFFF",
    "surface-2": "#F0F0F5",
    "surface-3": "#E5E5EA",
    navbar: "rgba(255, 255, 255, 0.90)",
    "text-primary": "#1C1C1E",
    "text-secondary": "rgba(28, 28, 30, 0.65)",
    "text-muted": "rgba(28, 28, 30, 0.55)",
    border: "rgba(0, 0, 0, 0.08)",
  },
} as const

const ACCENT_THEMES = {
  default: { name_en: "Default Red", accent: "#D11D1D", accent_light: "#E93C3C", accent_dark: "#A51414" },
  emerald: { name_en: "Emerald", accent: "#059669", accent_light: "#10B981", accent_dark: "#047857" },
  blue: { name_en: "Blue", accent: "#2563EB", accent_light: "#3B82F6", accent_dark: "#1D4ED8" },
  gold: { name_en: "Gold", accent: "#B8860B", accent_light: "#D4A017", accent_dark: "#8B6508" },
  midnight: { name_en: "Midnight", accent: "#7C3AED", accent_light: "#8B5CF6", accent_dark: "#6D28D9" },
  rose: { name_en: "Rose", accent: "#BE185D", accent_light: "#E11D6C", accent_dark: "#9D174D" },
  orange: { name_en: "Orange", accent: "#EA580C", accent_light: "#F97316", accent_dark: "#C2410C" },
} as const

type Mode = "dark" | "light"
type Preset = keyof typeof ACCENT_THEMES

interface WhatsAppConfig {
  numbers: { phone: string; label: string }[]
  orderTarget: string
}

interface SocialLink {
  platform: string
  url: string
}

interface SiteConfig {
  mode: Mode
  preset: Preset | "custom"
  accent: string
  accent_light: string
  accent_dark: string
  sections: Record<string, boolean>
  content: Record<string, unknown>
  whatsapp: WhatsAppConfig
  social: SocialLink[]
}

const defaultWhatsApp: WhatsAppConfig = {
  numbers: [{ phone: "+9647733310100", label: "Customer Support" }],
  orderTarget: "+9647733310100",
}

const defaultConfig: SiteConfig = {
  mode: "dark",
  preset: "default",
  accent: "#D11D1D",
  accent_light: "#E93C3C",
  accent_dark: "#A51414",
  sections: {},
  content: {},
  whatsapp: defaultWhatsApp,
  social: [],
}

const ConfigContext = createContext<SiteConfig>(defaultConfig)

export function useSiteConfig() { return useContext(ConfigContext) }

function setCSSVars(mode: Mode, accent: string, accentLight: string, accentDark: string) {
  const palette = BASE_PALETTES[mode]
  const root = document.documentElement
  root.style.setProperty("--bg", palette.bg)
  root.style.setProperty("--surface", palette.surface)
  root.style.setProperty("--surface-2", palette["surface-2"])
  root.style.setProperty("--surface-3", palette["surface-3"])
  root.style.setProperty("--navbar", palette.navbar)
  root.style.setProperty("--text-primary", palette["text-primary"])
  root.style.setProperty("--text-secondary", palette["text-secondary"])
  root.style.setProperty("--text-muted", palette["text-muted"])
  root.style.setProperty("--border", palette.border)
  root.style.setProperty("--accent", accent)
  root.style.setProperty("--accent-light", accentLight)
  root.style.setProperty("--accent-dark", accentDark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", accent)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/sections").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/settings").then(r => r.ok ? r.json() : []),
    ]).then(([secs, sets]) => {
      const sections: Record<string, boolean> = {}
      if (Array.isArray(secs)) secs.forEach((s: { key: string; visible: boolean }) => sections[s.key] = s.visible)

      let mode: Mode = "dark"
      let preset: Preset | "custom" = "default"
      let accent = "#D11D1D"
      let accentLight = "#E93C3C"
      let accentDark = "#A51414"

      if (Array.isArray(sets)) {
        const t = sets.find((s: { key: string; value?: { mode?: string; preset?: string; accent?: string; accent_light?: string; accent_dark?: string } }) => s.key === "theme")
        if (t?.value) {
          mode = t.value.mode === "light" ? "light" : "dark"
          preset = t.value.preset || "default"
          if (preset === "custom") {
            accent = t.value.accent || "#D11D1D"
            accentLight = t.value.accent_light || accent + "99"
            accentDark = t.value.accent_dark || accent
          } else {
            const theme = ACCENT_THEMES[preset as Preset] || ACCENT_THEMES.default
            accent = t.value.accent || theme.accent
            accentLight = t.value.accent_light || theme.accent_light
            accentDark = t.value.accent_dark || theme.accent_dark
          }
        }
      }

      let whatsapp = defaultWhatsApp
      if (Array.isArray(sets)) {
        const w = sets.find((s: { key: string; value?: WhatsAppConfig }) => s.key === "whatsapp")
        if (w?.value) {
          const wv = w.value
          whatsapp = {
            numbers: Array.isArray(wv.numbers) && wv.numbers.length > 0 ? wv.numbers : defaultWhatsApp.numbers,
            orderTarget: wv.orderTarget || wv.numbers?.[0]?.phone || defaultWhatsApp.orderTarget,
          }
        }
      }

      let content: Record<string, unknown> = {}
      if (Array.isArray(sets)) {
        const c = sets.find((s: { key: string; value?: Record<string, unknown> }) => s.key === "content")
        if (c?.value) content = c.value
      }

      let social: SocialLink[] = []
      if (Array.isArray(sets)) {
        const s = sets.find((s: { key: string; value?: SocialLink[] }) => s.key === "social")
        if (s?.value) social = s.value
      }

      setConfig(prev => ({ ...prev, sections, mode, preset, accent, accent_light: accentLight, accent_dark: accentDark, whatsapp, content, social }))
      setCSSVars(mode, accent, accentLight, accentDark)
    }).catch(() => {})
  }, [])

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export { ACCENT_THEMES, BASE_PALETTES }
export type { Mode, Preset, WhatsAppConfig, SocialLink }