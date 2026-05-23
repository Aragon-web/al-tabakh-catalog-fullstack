"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Loader2, Check, Plus, Trash2, MessageCircle } from "lucide-react"
import { ACCENT_THEMES, BASE_PALETTES } from "@/lib/theme-provider"
import type { Mode, Preset, WhatsAppConfig, SocialLink } from "@/lib/theme-provider"

const THEME_KEYS = Object.keys(ACCENT_THEMES) as Preset[]

export function AppearanceSection({ token, showToast }: { token: string; showToast: (type: "success" | "error", text: string) => void }) {
  const [mode, setMode] = useState<Mode>("dark")
  const [preset, setPreset] = useState<Preset>("default")
  const [customAccent, setCustomAccent] = useState("")
  const [sections, setSections] = useState<{ key: string; visible: boolean; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [useCustom, setUseCustom] = useState(false)
  const [whatsappData, setWhatsappData] = useState<WhatsAppConfig>({ numbers: [{ phone: "", label: "" }], orderTarget: "" })
  const [waSaving, setWaSaving] = useState(false)
  const [socialData, setSocialData] = useState<SocialLink[]>([])
  const [socialSaving, setSocialSaving] = useState(false)

  function applyTheme(m: Mode, p: Preset | "custom", accent: string) {
    const palette = BASE_PALETTES[m]
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
    root.style.setProperty("--accent-light", accent + "99")
    root.style.setProperty("--accent-dark", accent)
  }

  async function load() {
    setLoading(true)
    try {
      const [sRes, seRes] = await Promise.all([
        fetch("/api/admin/sections", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
        fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      ])
      if (Array.isArray(sRes)) setSections(sRes)
      if (Array.isArray(seRes)) {
        const t = seRes.find((s: { key: string; value?: { mode?: string; preset?: string; accent?: string } }) => s.key === "theme")
        if (t?.value) {
          const m = t.value.mode === "light" ? "light" : "dark"
          setMode(m)
          const p = t.value.preset || "default"
          if (p === "custom") {
            setUseCustom(true)
            const c = t.value.accent || "#D11D1D"
            setCustomAccent(c)
            applyTheme(m, "custom", c)
          } else if (THEME_KEYS.includes(p)) {
            setPreset(p)
            const theme = ACCENT_THEMES[p as Preset]
            applyTheme(m, p, theme.accent)
          }
        }
        const w = seRes.find((s: { key: string; value?: WhatsAppConfig }) => s.key === "whatsapp")
        if (w?.value && Array.isArray(w.value.numbers) && w.value.numbers.length > 0) {
          setWhatsappData(w.value)
        } else {
          setWhatsappData({ numbers: [{ phone: "+9647733310100", label: "Customer Support" }], orderTarget: "+9647733310100" })
        }
        const soc = seRes.find((s: { key: string; value?: SocialLink[] }) => s.key === "social")
        if (soc?.value) setSocialData(soc.value)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/set-state-in-effect,react-hooks/exhaustive-deps

  async function saveTheme(m: Mode, p: Preset | "custom", accent?: string) {
    setSaving(true)
    const a = p === "custom" ? (accent || customAccent) : ACCENT_THEMES[p as Preset].accent
    const value = { mode: m, preset: p, accent: a, accent_light: a + "99", accent_dark: a }
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key: "theme", value }) })
      if (res.ok) { applyTheme(m, p, a); showToast("success", "Theme saved") }
      else showToast("error", "Failed to save")
    } catch { showToast("error", "Network error") }
    setSaving(false)
  }

  function toggleMode() {
    const m = mode === "dark" ? "light" : "dark"
    setMode(m)
    if (useCustom) applyTheme(m, "custom", customAccent)
    else applyTheme(m, preset, ACCENT_THEMES[preset].accent)
    saveTheme(m, useCustom ? "custom" : preset, useCustom ? customAccent : undefined)
  }

  async function saveWhatsApp() {
    setWaSaving(true)
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key: "whatsapp", value: whatsappData }) })
      if (res.ok) showToast("success", "WhatsApp settings saved")
      else showToast("error", "Failed to save")
    } catch { showToast("error", "Network error") }
    setWaSaving(false)
  }

  async function saveSocial() {
    setSocialSaving(true)
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key: "social", value: socialData }) })
      if (res.ok) showToast("success", "Social links saved")
      else showToast("error", "Failed to save")
    } catch { showToast("error", "Network error") }
    setSocialSaving(false)
  }

  function updateSocial(idx: number, field: "platform" | "url", value: string) {
    setSocialData(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function addSocial() {
    setSocialData(prev => [...prev, { platform: "", url: "" }])
  }

  function removeSocial(idx: number) {
    setSocialData(prev => prev.filter((_, i) => i !== idx))
  }

  function addWaNumber() {
    setWhatsappData(prev => ({ ...prev, numbers: [...prev.numbers, { phone: "", label: "" }] }))
  }

  function removeWaNumber(idx: number) {
    setWhatsappData(prev => {
      const nums = prev.numbers.filter((_, i) => i !== idx)
      const orderTarget = prev.orderTarget === prev.numbers[idx]?.phone ? (nums[0]?.phone || "") : prev.orderTarget
      return { numbers: nums, orderTarget }
    })
  }

  function updateWaNumber(idx: number, field: "phone" | "label", value: string) {
    setWhatsappData(prev => {
      const nums = prev.numbers.map((n, i) => i === idx ? { ...n, [field]: value } : n)
      return { ...prev, numbers: nums }
    })
  }

  async function toggleSection(key: string, visible: boolean) {
    try {
      const res = await fetch("/api/admin/sections", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, visible }) })
      if (res.ok) { setSections(prev => prev.map(s => s.key === key ? { ...s, visible } : s)); showToast("success", `${key} ${visible ? "shown" : "hidden"}`) }
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} /></div>

  return (
    <div className="space-y-8">
      {/* Dark/Light Toggle */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3">Mode</h2>
        <button onClick={toggleMode} disabled={saving}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-sm font-medium">{mode === "dark" ? "Dark Mode" : "Light Mode"}</span>
          <div className="relative w-11 h-6 rounded-full ml-auto" style={{ background: mode === "dark" ? "var(--accent)" : "var(--surface-3)" }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm" style={{ transform: mode === "dark" ? "translateX(22px)" : "translateX(2px)" }} />
          </div>
        </button>
      </div>

      {/* Accent Color */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3">Accent Color</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {THEME_KEYS.map(key => {
            const t = ACCENT_THEMES[key]
            return (
              <button key={key} onClick={() => { setPreset(key); setUseCustom(false); saveTheme(mode, key) }}
                className="p-3 rounded-xl text-left transition-all" style={{
                  background: preset === key && !useCustom ? "var(--surface-2)" : "var(--surface)",
                  border: preset === key && !useCustom ? `2px solid ${t.accent}` : "1px solid var(--border)",
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full" style={{ background: t.accent }} />
                  <span className="text-xs font-medium">{t.name_en}</span>
                  {preset === key && !useCustom && <Check size={12} style={{ color: t.accent }} />}
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ background: t.accent }} />
                  <div className="w-3 h-3 rounded-sm" style={{ background: t.accent_light }} />
                  <div className="w-3 h-3 rounded-sm" style={{ background: t.accent_dark }} />
                </div>
              </button>
            )
          })}
        </div>
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={useCustom} onChange={e => { setUseCustom(e.target.checked); if (e.target.checked) setCustomAccent(ACCENT_THEMES[preset].accent) }} />
              Custom
            </label>
            {useCustom && (
              <>
                <input type="color" value={customAccent} onChange={e => setCustomAccent(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer" style={{ border: "1px solid var(--border)" }} />
                <input type="text" value={customAccent} onChange={e => setCustomAccent(e.target.value)}
                  className="w-24 px-2 py-1.5 rounded text-xs outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <button onClick={() => saveTheme(mode, "custom", customAccent)} disabled={saving}
                  className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1" style={{ background: "var(--accent)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
                  {saving && <Loader2 size={10} className="animate-spin" />} Apply
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section Visibility */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3">Section Visibility</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sections.map(s => (
            <div key={s.key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <span className="text-sm">{s.label}</span>
              <button onClick={() => toggleSection(s.key, !s.visible)}
                className="relative w-11 h-6 rounded-full transition-colors" style={{ background: s.visible ? "var(--accent)" : "var(--surface-3)" }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm" style={{ transform: s.visible ? "translateX(22px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={18} style={{ color: "var(--wa)" }} />
          <h2 className="text-base sm:text-lg font-bold">WhatsApp Numbers</h2>
        </div>
        <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {whatsappData.numbers.map((n, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={n.label} onChange={e => updateWaNumber(idx, "label", e.target.value)}
                  placeholder="Label (e.g. Sales)"
                  className="px-3 py-2 rounded-lg text-xs outline-none" aria-label={`Number ${idx + 1} label`} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <div className="flex items-center gap-2">
                  <input value={n.phone} onChange={e => updateWaNumber(idx, "phone", e.target.value)}
                    placeholder="+964XXXXXXXXX"
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none font-mono" aria-label={`Number ${idx + 1} phone`} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <button onClick={() => removeWaNumber(idx)} className="p-2 rounded-lg flex-shrink-0" style={{ color: "var(--accent)" }} aria-label="Remove number">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addWaNumber} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity" style={{ color: "var(--accent)", background: "var(--surface-2)" }}>
            <Plus size={12} /> Add Number
          </button>

          {whatsappData.numbers.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>Order Target Number</p>
              <select value={whatsappData.orderTarget} onChange={e => setWhatsappData(prev => ({ ...prev, orderTarget: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {whatsappData.numbers.map((n, idx) => (
                  <option key={idx} value={n.phone}>{n.label || n.phone}</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={saveWhatsApp} disabled={waSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity" style={{ background: "var(--wa)", color: "#fff", opacity: waSaving ? 0.7 : 1 }}>
            {waSaving && <Loader2 size={10} className="animate-spin" />}
            <MessageCircle size={11} /> Save WhatsApp Settings
          </button>
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
          <span style={{ color: "var(--accent)" }}>@</span>
          Social Media Links
        </h2>
        <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Platform: facebook, instagram, youtube, twitter, tiktok, website</p>
          {socialData.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input value={s.platform} onChange={e => updateSocial(idx, "platform", e.target.value)}
                placeholder="Platform" className="w-28 px-2 py-2 rounded-lg text-xs outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input value={s.url} onChange={e => updateSocial(idx, "url", e.target.value)}
                placeholder="https://..." className="flex-1 px-2 py-2 rounded-lg text-xs outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button onClick={() => removeSocial(idx)} className="p-2 rounded-lg flex-shrink-0" style={{ color: "var(--accent)" }} aria-label="Remove social link">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={addSocial} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: "var(--accent)", background: "var(--surface-2)" }}>
              <Plus size={12} /> Add Link
            </button>
            <button onClick={saveSocial} disabled={socialSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: socialSaving ? 0.7 : 1 }}>
              {socialSaving && <Loader2 size={10} className="animate-spin" />}
              Save Social Links
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}