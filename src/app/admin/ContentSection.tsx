"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Save, RotateCcw, Eye, EyeOff, Check, Circle } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"
import { Spinner } from "@/components/Spinner"
import { useDelayedLoading } from "@/lib/useDelayedLoading"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

const PAGE_SECTIONS: Record<string, string[]> = {
  home: ["hero", "brand_story"],
  footer: ["footer"],
  about: [],
  faq: [],
  loyalty: [],
}

const PAGES = [
  { id: "all", label: "allPages" },
  { id: "home", label: "homePage" },
  { id: "footer", label: "footer" },
  { id: "about", label: "aboutPage" },
  { id: "faq", label: "faqPage" },
  { id: "loyalty", label: "loyaltyPage" },
]

function toFlat(admin: Record<string, Record<string, string>>): Record<string, string> {
  const flat: Record<string, string> = {}
  for (const [lang, fields] of Object.entries(admin)) {
    for (const [field, value] of Object.entries(fields)) {
      flat[`${field}_${lang}`] = value
    }
  }
  return flat
}

function fromFlat(flat: Record<string, string>): Record<string, Record<string, string>> {
  const en: Record<string, string> = {}
  const ar: Record<string, string> = {}
  for (const [k, v] of Object.entries(flat)) {
    if (k.endsWith("_en")) en[k.slice(0, -3)] = v
    else if (k.endsWith("_ar")) ar[k.slice(0, -3)] = v
  }
  return { en, ar }
}

export function ContentSection({ token, showToast }: { token: string; showToast: (type: "success" | "error", text: string) => void }) {
  const { lang } = useStore(); const t = adminT[lang]
  const [page, setPage] = useState("all")
  const [allContent, setAllContent] = useState<Record<string, Record<string, string>>>({})
  const [items, setItems] = useState<{ section: string; content: Record<string, Record<string, string>> }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [editContent, setEditContent] = useState<Record<string, string>>({})
  const [confirmReset, setConfirmReset] = useState(false)
  const [previewSection, setPreviewSection] = useState<string | null>(null)
  const [editLang, setEditLang] = useState<Record<string, "en" | "ar">>({})
  const showLoading = useDelayedLoading(loading, 300)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const allContentRef = useRef(allContent)
  const editContentRef = useRef(editContent)
  allContentRef.current = allContent
  editContentRef.current = editContent

  async function loadContent() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { setLoading(false); return }
      const allSettings = await res.json()
      const contentSetting = (Array.isArray(allSettings) ? allSettings : []).find((s: { key: string }) => s.key === "content")
      const content: Record<string, Record<string, string>> = contentSetting?.value || {}
      setAllContent(content)
      const allSections = Object.keys(content)
      if (page === "all") {
        setItems(allSections.map(s => ({ section: s, content: fromFlat(content[s]) })))
      } else {
        const sectionNames = PAGE_SECTIONS[page] || []
        setItems(sectionNames.filter(s => content[s]).map(s => ({ section: s, content: fromFlat(content[s]) })))
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadContent() }, [page]) // eslint-disable-line

  const doSave = useCallback(async (section: string) => {
    const currentAC = allContentRef.current
    const currentEC = editContentRef.current
    setSaving(prev => ({ ...prev, [section]: true }))
    const existingFlat = currentAC[section] || {}
    const updatedFlat: Record<string, string> = {}
    for (const [key, originalVal] of Object.entries(existingFlat)) {
      if (key.endsWith("_en")) {
        const field = key.slice(0, -3)
        const editKey = `${section}_en_${field}`
        updatedFlat[key] = currentEC[editKey] !== undefined ? currentEC[editKey] : originalVal
      } else if (key.endsWith("_ar")) {
        const field = key.slice(0, -3)
        const editKey = `${section}_ar_${field}`
        updatedFlat[key] = currentEC[editKey] !== undefined ? currentEC[editKey] : originalVal
      } else {
        updatedFlat[key] = originalVal
      }
    }
    try {
      const getRes = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      const allSettings = getRes.ok ? await getRes.json() : []
      const existingContentSetting = (Array.isArray(allSettings) ? allSettings : []).find((s: { key: string }) => s.key === "content")
      const merged = { ...((existingContentSetting?.value as Record<string, unknown>) || {}), [section]: updatedFlat }
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: "content", value: merged }),
      })
      if (res.ok) {
        setAllContent(prev => ({ ...prev, [section]: updatedFlat }))
        setSaved(prev => ({ ...prev, [section]: true }))
        setDirty(prev => ({ ...prev, [section]: false }))
        setTimeout(() => setSaved(prev => ({ ...prev, [section]: false })), 2000)
      } else {
        showToast("error", `Failed to save ${section}`)
      }
    } catch { showToast("error", "Network error") }
    setSaving(prev => ({ ...prev, [section]: false }))
  }, [token, showToast])

  function updateField(section: string, lang: string, field: string, value: string) {
    const key = `${section}_${lang}_${field}`
    setEditContent(prev => ({ ...prev, [key]: value }))
    setDirty(prev => ({ ...prev, [section]: true }))
    setSaved(prev => ({ ...prev, [section]: false }))
    if (debounceTimers.current[section]) {
      clearTimeout(debounceTimers.current[section])
    }
    debounceTimers.current[section] = setTimeout(() => {
      doSave(section)
    }, 1500)
  }

  function getField(section: string, lang: string, field: string): string {
    const editKey = `${section}_${lang}_${field}`
    if (editContent[editKey] !== undefined) return editContent[editKey]
    const content = allContent[section]
    if (!content) return ""
    return content[`${field}_${lang}`] || ""
  }

  function getAllFields(section: string): string[] {
    const content = allContent[section]
    if (!content) return []
    const fields = new Set<string>()
    for (const k of Object.keys(content)) {
      if (k.endsWith("_en")) fields.add(k.slice(0, -3))
      else if (k.endsWith("_ar")) fields.add(k.slice(0, -3))
    }
    return Array.from(fields)
  }

  function renderInput(section: string, sectionLang: string, field: string, value: string) {
    const isRtl = sectionLang === "ar"
    const multiline = value.includes("\n") || value.length > 80
    const maxLength = field === "title" ? 120 : field === "body" ? 1000 : 300
    const rows = field === "body" ? 6 : 4

    const baseStyle: React.CSSProperties = {
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)",
      direction: isRtl ? "rtl" : "ltr",
      fontFamily: isRtl ? '"Noto Sans Arabic", "Tajawal", sans-serif' : undefined,
      width: "100%",
      fontSize: "0.75rem",
      lineHeight: "1.5",
      outline: "none",
      borderRadius: "0.5rem",
      padding: "0.5rem 0.75rem",
      boxSizing: "border-box",
    }

    return (
      <div>
        {multiline ? (
          <textarea
            value={value}
            onChange={e => updateField(section, sectionLang, field, e.target.value)}
            placeholder={sectionLang === "en" ? t.english : t.arabicPlaceholder}
            rows={rows}
            maxLength={maxLength}
            style={{ ...baseStyle, resize: "vertical", minHeight: `${rows * 1.5}em` }}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => updateField(section, sectionLang, field, e.target.value)}
            placeholder={sectionLang === "en" ? t.english : t.arabicPlaceholder}
            maxLength={maxLength}
            style={baseStyle}
          />
        )}
        <div className="flex justify-end mt-1">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    )
  }

  function renderPreview(section: string) {
    const flat = allContent[section]
    if (!flat) return null
    const en: Record<string, string> = {}
    const ar: Record<string, string> = {}
    for (const [k, v] of Object.entries(flat)) {
      if (k.endsWith("_en")) en[k.slice(0, -3)] = v
      else if (k.endsWith("_ar")) ar[k.slice(0, -3)] = v
    }
    const display = lang === "ar" ? ar : en

    if (section === "hero") {
      return (
        <div className="mt-3 p-4 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t.preview}</p>
          <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius: "0.5rem", padding: "2rem", textAlign: "center" as const }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", whiteSpace: "pre-line" }}>
              {display.title || "Title"}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem", maxWidth: "400px", margin: "0 auto 1rem" }}>
              {display.subtitle || "Subtitle"}
            </p>
            <span style={{ display: "inline-block", padding: "0.5rem 1.25rem", background: "var(--accent)", color: "#fff", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
              {display.cta || "CTA"}
            </span>
          </div>
        </div>
      )
    }
    if (section === "brand_story") {
      return (
        <div className="mt-3 p-4 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t.preview}</p>
          <div style={{ padding: "1.5rem", borderRadius: "0.5rem", background: "var(--surface)" }}>
            {display.tag && <span style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>{display.tag}</span>}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.5rem", whiteSpace: "pre-line" }}>{display.title || "Title"}</h2>
            {display.body && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem", whiteSpace: "pre-line", lineHeight: "1.6" }}>{display.body}</p>}
            {display.cta && <span style={{ display: "inline-block", marginTop: "0.75rem", padding: "0.4rem 1rem", background: "var(--accent)", color: "#fff", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>{display.cta}</span>}
          </div>
        </div>
      )
    }
    return null
  }

  function renderFields(section: string) {
    const fields = getAllFields(section)
    const sectionLang = editLang[section] || lang
    const isDirty = dirty[section]
    const isSaving = saving[section]
    const isSaved = saved[section]

    return (
      <div key={section} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold capitalize">{section.replace(/_/g, " ")}</h3>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <Spinner size={12} />
            ) : isSaved ? (
              <Check size={12} style={{ color: "var(--accent)" }} />
            ) : isDirty ? (
              <Circle size={10} fill="var(--accent)" style={{ color: "var(--accent)" }} />
            ) : null}
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <button
                onClick={() => setEditLang(prev => ({ ...prev, [section]: "en" }))}
                className="px-2 py-1 text-[10px] font-medium"
                style={{
                  background: sectionLang === "en" ? "var(--accent)" : "var(--surface-2)",
                  color: sectionLang === "en" ? "#fff" : "var(--text-secondary)",
                }}
              >EN</button>
              <button
                onClick={() => setEditLang(prev => ({ ...prev, [section]: "ar" }))}
                className="px-2 py-1 text-[10px] font-medium"
                style={{
                  background: sectionLang === "ar" ? "var(--accent)" : "var(--surface-2)",
                  color: sectionLang === "ar" ? "#fff" : "var(--text-secondary)",
                }}
              >AR</button>
            </div>
            {(section === "hero" || section === "brand_story") && (
              <button
                onClick={() => setPreviewSection(prev => prev === section ? null : section)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                {previewSection === section ? <EyeOff size={11} /> : <Eye size={11} />}
                {previewSection === section ? t.hidePreview : t.preview}
              </button>
            )}
            <button
              onClick={() => doSave(section)}
              disabled={isSaving}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
              style={{
                background: "var(--accent)",
                color: "#fff",
                opacity: isSaving ? 0.5 : 1,
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              <Save size={10} />
              {t.save}
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {fields.map(field => (
            <div key={field}>
              <p className="text-[10px] font-medium uppercase mb-1" style={{ color: "var(--text-muted)" }}>{field}</p>
              {renderInput(section, sectionLang, field, getField(section, sectionLang, field))}
            </div>
          ))}
        </div>
        {previewSection === section && renderPreview(section)}
      </div>
    )
  }

  async function restoreDefaults() {
    setConfirmReset(false)
    const defaults: Record<string, Record<string, string>> = {
      hero: toFlat({
        en: { title: "Premium Food\nProducts", subtitle: "Quality ingredients from Malek Al-Tabakh Company — bringing authentic flavors to every kitchen since 1999.", cta: "Discover Products" },
        ar: { title: "منتجات غذائية\nفاخرة", subtitle: "مكونات عالية الجودة من شركة مالك الطباخ — نكهات أصيلة لكل مطبخ منذ ١٩٩٩.", cta: "تصفح المنتجات" },
      }),
      brand_story: toFlat({
        en: { tag: "Our Story", title: "A Legacy of\nFine Flavors", body: "Since 1999, Malek Al-Tabakh has been a trusted name in premium food products across Iraq. What began as a commitment to quality has grown into a comprehensive selection of spices, baking supplies, sweets powders, and pastry ingredients — serving families, restaurants, and businesses alike.\n\nOur passion lies in bringing authentic flavors to every kitchen. We carefully source each product to ensure it meets the highest standards of taste and quality. From traditional Iraqi spices to specialty baking essentials, every item reflects our dedication to excellence.", cta: "Browse All Products" },
        ar: { tag: "قصتنا", title: "إرث من\nالنكهات الأصيلة", body: "منذ ١٩٩٩، شركة مالك الطباخ اسم موثوق في المنتجات الغذائية الممتازة في جميع أنحاء العراق. ما بدأ كالتزام بالجودة نما ليشمل تشكيلة واسعة من البهارات ومستلزمات الخبز ومساحيق الحلويات ومكونات المعجنات — لخدمة العائلات والمطاعم والشركات على حد سواء.\n\nشغفنا يكمن في تقديم نكهات أصيلة لكل مطبخ. نختار كل منتج بعناية لضمان استيفائه لأعلى معايير الطعم والجودة. من البهارات العراقية التقليدية إلى أساسيات الخبز المتخصصة، كل قطعة تعكس تفانينا في التميز.", cta: "تصفح جميع المنتجات" },
      }),
      footer: toFlat({
        en: { about_text: "Premium food products provider serving businesses and families with authentic quality since 1999.", rights: "All rights reserved." },
        ar: { about_text: "مزود منتجات غذائية متميزة يخدم الشركات والعائلات بجودة أصيلة منذ ١٩٩٩.", rights: "جميع الحقوق محفوظة." },
      }),
    }
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key: "content", value: defaults }) })
      if (res.ok) { showToast("success", "Defaults restored"); loadContent() }
      else showToast("error", "Failed to restore")
    } catch { showToast("error", "Network error") }
  }

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select value={page} onChange={e => setPage(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
          {PAGES.map(p => <option key={p.id} value={p.id}>{(t as Record<string, string>)[p.label]}</option>)}
        </select>
        <button onClick={() => setConfirmReset(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
          <RotateCcw size={11} />
          {t.reset}
        </button>
        <ConfirmDialog
          open={confirmReset}
          title={t.resetContent}
          message={t.resetConfirm}
          confirmLabel={t.reset}
          onConfirm={restoreDefaults}
          onCancel={() => setConfirmReset(false)}
        />
      </div>
      {showLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>{t.noEditableContent}</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => renderFields(item.section))}
        </div>
      )}
    </div>
  )
}
