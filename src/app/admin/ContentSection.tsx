"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, RotateCcw } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"

const PAGE_SECTIONS: Record<string, string[]> = {
  home: ["hero", "brand_story"],
  footer: ["footer"],
  about: [],
  faq: [],
  loyalty: [],
}

const PAGES = [
  { id: "home", label: "Home Page" },
  { id: "footer", label: "Footer" },
  { id: "about", label: "About Page" },
  { id: "faq", label: "FAQ Page" },
  { id: "loyalty", label: "Loyalty Page" },
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
  const [page, setPage] = useState("home")
  const [items, setItems] = useState<{ section: string; content: Record<string, Record<string, string>> }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<Record<string, string>>({})
  const [confirmReset, setConfirmReset] = useState(false)

  async function loadContent() {
    setLoading(true)
    setSaving(null)
    try {
      const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { setLoading(false); return }
      const allSettings = await res.json()
      const contentSetting = (Array.isArray(allSettings) ? allSettings : []).find((s: { key: string }) => s.key === "content")
      const allContent: Record<string, Record<string, string>> = contentSetting?.value || {}
      const sectionNames = PAGE_SECTIONS[page] || []
      const pageItems = sectionNames
        .filter(s => allContent[s])
        .map(s => ({ section: s, content: fromFlat(allContent[s] as Record<string, string>) }))
      setItems(pageItems)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadContent() }, [page])

  function updateField(section: string, lang: string, field: string, value: string) {
    const key = `${section}_${lang}_${field}`
    setEditContent(prev => ({ ...prev, [key]: value }))
  }

  function getField(content: Record<string, Record<string, string>>, lang: string, field: string): string {
    return content?.[lang]?.[field] || ""
  }

  function getAllFields(item: { section: string; content: Record<string, Record<string, string>> }): string[] {
    const enFields = item.content?.en ? Object.keys(item.content.en) : []
    const arFields = item.content?.ar ? Object.keys(item.content.ar) : []
    return [...new Set([...enFields, ...arFields])]
  }

  function renderFields(item: { section: string; content: Record<string, Record<string, string>> }) {
    const langs = ["en", "ar"]
    const fields = getAllFields(item)

    return (
      <div key={item.section} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-bold mb-3 capitalize">{item.section.replace(/_/g, " ")}</h3>
        <div className="space-y-3">
          {fields.map(field => (
            <div key={field}>
              <p className="text-[10px] font-medium uppercase mb-1" style={{ color: "var(--text-muted)" }}>{field}</p>
              <div className="grid grid-cols-2 gap-2">
                {langs.map(lang => (
                  <input key={lang} value={getField(item.content, lang, field)}
                    onChange={e => updateField(item.section, lang, field, e.target.value)}
                    placeholder={lang === "en" ? "English" : "العربية"}
                    className="px-3 py-2 rounded-lg text-xs outline-none"
                    style={{
                      background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)",
                      direction: lang === "ar" ? "rtl" : "ltr",
                      fontFamily: lang === "ar" ? '"Noto Sans Arabic", "Tajawal", sans-serif' : undefined,
                    }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => saveItem(item)} disabled={saving === item.section}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: saving === item.section ? 0.7 : 1 }}>
          {saving === item.section && <Loader2 size={10} className="animate-spin" />}
          <Save size={11} /> Save
        </button>
      </div>
    )
  }

  async function saveItem(item: { section: string; content: Record<string, Record<string, string>> }) {
    setSaving(item.section)
    const fields = getAllFields(item)
    const updatedAdmin: Record<string, Record<string, string>> = { en: {}, ar: {} }
    fields.forEach(f => {
      updatedAdmin.en[f] = editContent[`${item.section}_en_${f}`] || getField(item.content, "en", f)
      updatedAdmin.ar[f] = editContent[`${item.section}_ar_${f}`] || getField(item.content, "ar", f)
    })
    try {
      const getRes = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      const allSettings = getRes.ok ? await getRes.json() : []
      const existingContent = (Array.isArray(allSettings) ? allSettings : []).find((s: { key: string }) => s.key === "content")
      const merged = { ...((existingContent?.value as Record<string, unknown>) || {}), [item.section]: toFlat(updatedAdmin) }
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ key: "content", value: merged }) })
      if (res.ok) showToast("success", `${item.section} saved`)
      else showToast("error", "Failed to save")
    } catch { showToast("error", "Network error") }
    setSaving(null)
  }

  async function restoreDefaults() {
    setConfirmReset(false)
    setSaving("restore")
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
    setSaving(null)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select value={page} onChange={e => setPage(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
          {PAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <button onClick={() => setConfirmReset(true)} disabled={saving === "restore"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)", opacity: saving === "restore" ? 0.7 : 1 }}>
          {saving === "restore" ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={11} />}
          Reset
        </button>
        <ConfirmDialog
          open={confirmReset}
          title="Reset Content"
          message="Reset all editable content to defaults?"
          confirmLabel="Reset"
          onConfirm={restoreDefaults}
          onCancel={() => setConfirmReset(false)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} /></div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>No editable content for this page</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => renderFields(item))}
        </div>
      )}
    </div>
  )
}