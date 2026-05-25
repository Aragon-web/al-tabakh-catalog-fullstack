"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Edit3, Trash2, BookOpen, Search } from "lucide-react"
import { useFocusTrap } from "@/lib/useFocusTrap"
import { UploadDropzone } from "./UploadDropzone"
import { ConfirmDialog } from "./ConfirmDialog"
import type { Recipe } from "@/lib/types"
import { Spinner } from "@/components/Spinner"
import { useDelayedLoading } from "@/lib/useDelayedLoading"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface Props { token: string; showToast: (type: "success" | "error", msg: string) => void }

export function RecipesSection({ token, showToast }: Props) {
  const { lang, products } = useStore(); const t = adminT[lang]
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title_en: "", title_ar: "", excerpt_en: "", excerpt_ar: "", content_en: "", content_ar: "", image_url: "", author: "", published: false, relatedProductIds: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const focusRef = useFocusTrap(modal)
  const filteredProducts = useMemo(() =>
    products.filter(p => {
      const q = productSearch.toLowerCase()
      return !q || p.name_en.toLowerCase().includes(q) || p.name_ar.toLowerCase().includes(q)
    }),
    [products, productSearch]
  )

  const load = useCallback(async () => {
    const res = await fetch("/api/recipes")
    if (res.ok) setRecipes(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  function injectProductIds(content: string, ids: string[]): string {
    try {
      const obj = JSON.parse(content)
      obj.relatedProductIds = ids
      return JSON.stringify(obj)
    } catch { return content }
  }

  function extractProductIds(content: string): string[] {
    try {
      const obj = JSON.parse(content)
      return Array.isArray(obj.relatedProductIds) ? obj.relatedProductIds : []
    } catch { return [] }
  }

  async function save() {
    if (!form.title_en.trim() || !form.title_ar.trim()) {
      showToast("error", "Title in both languages is required"); return
    }
    setSaving(true)
    try {
      const url = editId ? `/api/recipes/${editId}` : "/api/recipes"
      const method = editId ? "PUT" : "POST"
      const body = {
        ...form,
        content_en: injectProductIds(form.content_en, form.relatedProductIds),
        content_ar: injectProductIds(form.content_ar, form.relatedProductIds),
      }
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      if (!res.ok) { showToast("error", t.failedToSave); return }
      showToast("success", editId ? t.recipeUpdated : t.recipeCreated)
      setModal(false); setEditId(null); setForm({ title_en: "", title_ar: "", excerpt_en: "", excerpt_ar: "", content_en: "", content_ar: "", image_url: "", author: "", published: false, relatedProductIds: [] })
      load()
    } finally { setSaving(false) }
  }

  async function confirmDeleteRecipe() {
    if (!confirmDelete) return
    setSaving(true)
    try {
      const res = await fetch(`/api/recipes/${confirmDelete}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { showToast("error", t.failedToDelete); return }
      showToast("success", t.recipeDeleted); load()
    } finally { setSaving(false); setConfirmDelete(null) }
  }

  function openEdit(r: Recipe) {
    setEditId(r.id); setForm({
      title_en: r.title_en, title_ar: r.title_ar, excerpt_en: r.excerpt_en, excerpt_ar: r.excerpt_ar,
      content_en: r.content_en, content_ar: r.content_ar, image_url: r.image_url, author: r.author,
      published: r.published, relatedProductIds: extractProductIds(r.content_en),
    }); setModal(true)
  }

  const showLoading = useDelayedLoading(loading, 300)
  if (showLoading) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Spinner size={24} />
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.loadingRecipes}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <BookOpen size={15} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t.recipes}</h2>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{recipes.length} {lang === "en" ? "recipes" : "وصفة"}</p>
          </div>
        </div>
        <button onClick={() => { setEditId(null); setForm({ title_en: "", title_ar: "", excerpt_en: "", excerpt_ar: "", content_en: "", content_ar: "", image_url: "", author: "", published: false, relatedProductIds: [] }); setModal(true) }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> {t.addRecipe}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recipes.map(r => (
          <div key={r.id} className="group rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="relative aspect-[16/9] overflow-hidden" style={{ background: "var(--surface-2)" }}>
              {r.image_url ? (
                <img src={r.image_url} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><BookOpen size={28} style={{ color: "var(--text-muted)" }} /></div>
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 50%)" }} />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.published ? "" : ""}`}
                  style={{ background: r.published ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.12)", color: r.published ? "#22C55E" : "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
                  {r.published ? (lang === "en" ? "Published" : "منشور") : (lang === "en" ? "Draft" : "مسودة")}
                </span>
              </div>
            </div>
            <div className="p-3.5 space-y-2.5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold leading-snug line-clamp-1" style={{ color: "var(--text-primary)" }}>{r.title_en}</h3>
                <p className="text-xs leading-snug line-clamp-1" style={{ color: "var(--text-muted)" }} dir="rtl">{r.title_ar}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {r.author && <span>{r.author}</span>}
                  {r.author && r.created_at && <span className="w-px h-3" style={{ background: "var(--border)" }} />}
                  {r.created_at && <span>{new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg transition-colors hover:bg-surface-2" style={{ color: "var(--text-muted)" }} aria-label={t.editRecipe}><Edit3 size={13} /></button>
                  <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg transition-colors hover:bg-surface-2" style={{ color: "var(--text-muted)" }} aria-label={t.deleteDefault}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {recipes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <BookOpen size={32} style={{ color: "var(--text-muted)", opacity: 0.3 }} />
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>{t.noRecipes}</p>
          </div>
        )}
      </div>

      {modal && (
        <div ref={focusRef} className="fixed inset-0 z-50 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={editId ? t.editRecipe : t.addRecipe}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => !saving && setModal(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto animate-fade-in" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 25px 80px rgba(0,0,0,0.4)" }}>
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b backdrop-blur-xl" style={{ borderColor: "var(--border)", background: "rgba(var(--surface-rgb), 0.9)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
                  <BookOpen size={15} color="#fff" />
                </div>
                <span className="text-sm font-bold">{editId ? t.editRecipe : t.addRecipe}</span>
              </div>
              <button onClick={() => setModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-surface-2" style={{ color: "var(--text-muted)" }} aria-label="Close">&times;</button>
            </div>

            <div className="p-5 space-y-5">
              {/* Image preview + upload */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {form.image_url ? (
                    <img src={form.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} style={{ color: "var(--text-muted)", opacity: 0.4 }} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>{t.imageUrl}</label>
                  <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 mb-2"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} />
                  <UploadDropzone currentUrl={form.image_url} onUpload={(url) => setForm(p => ({ ...p, image_url: url }))} token={token} />
                </div>
              </div>

              {/* EN / AR side-by-side fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>English</p>
                  <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.titleEn}</label><input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder="Recipe title" /></div>
                  <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.excerptEn}</label><textarea value={form.excerpt_en} onChange={e => setForm(p => ({ ...p, excerpt_en: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder="Short description" /></div>
                  <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.contentEn}</label><textarea value={form.content_en} onChange={e => setForm(p => ({ ...p, content_en: e.target.value }))} rows={5} className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-y outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder='{"prepTime":"...", "cookTime":"...", "ingredients":[...], ...}' /></div>
                </div>
                <div className="space-y-3.5" dir="rtl">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }} dir="ltr">العربية</p>
                  <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.titleAr}</label><input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder="عنوان الوصفة" /></div>
                  <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.excerptAr}</label><textarea value={form.excerpt_ar} onChange={e => setForm(p => ({ ...p, excerpt_ar: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder="وصف قصير" /></div>
                  <div><label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.contentAr}</label><textarea value={form.content_ar} onChange={e => setForm(p => ({ ...p, content_ar: e.target.value }))} rows={5} className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-y outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder='{"prepTime":"...", "cookTime":"...", ...}' /></div>
                </div>
              </div>

              {/* Author + Published row */}
              <div className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{t.author}</label>
                  <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="w-full max-w-xs px-3.5 py-2 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} placeholder="Malek Al-Tabakh" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none ml-4">
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t.published}</span>
                  <div className="relative w-11 h-6 rounded-full transition-colors duration-200" style={{ background: form.published ? "var(--accent)" : "var(--border)" }}>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm" style={{ transform: form.published ? "translateX(20px)" : "translateX(0)" }} />
                    <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="sr-only" />
                  </div>
                </label>
              </div>

              {/* Products picker */}
              <details className="group rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-surface-2" style={{ background: "var(--surface-2)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t.selectProducts}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "var(--accent)", color: "#fff" }}>{form.relatedProductIds.length}</span>
                  </div>
                  <svg className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <div className="p-3.5 space-y-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder={t.searchRecipeProducts}
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-xs outline-none transition-all duration-200 focus:ring-2"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties} />
                    {productSearch && (
                      <button onClick={() => setProductSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70" style={{ color: "var(--text-muted)" }} aria-label="Clear">&times;</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto rounded-xl p-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    {filteredProducts.map(p => {
                      const selected = form.relatedProductIds.includes(p.id)
                      return (
                        <button key={p.id} onClick={() => setForm(f => ({
                          ...f, relatedProductIds: selected ? f.relatedProductIds.filter(id => id !== p.id) : [...f.relatedProductIds, p.id]
                        }))}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-all duration-150 active:scale-[0.97]"
                          style={{
                            background: selected ? "var(--accent)" : "var(--surface-2)",
                            color: selected ? "#fff" : "var(--text-secondary)",
                            boxShadow: selected ? "0 2px 12px rgba(0,0,0,0.2)" : "none",
                          }}>
                          <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: "var(--surface)" }}>
                            {p.image_url ? <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px]" style={{ color: "var(--text-muted)" }}>?</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[11px] font-medium">{lang === "en" ? p.name_en : p.name_ar}</div>
                            <div className="truncate text-[9px]" style={{ color: selected ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}>{p.weight || ""}</div>
                          </div>
                        </button>
                      )
                    })}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-full py-6 text-center">
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.noRecipeProducts}</p>
                      </div>
                    )}
                  </div>
                </div>
              </details>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-1">
                <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>{t.cancel}</button>
                <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-1.5"
                  style={{ background: "var(--accent)", color: "#fff", opacity: saving ? 0.7 : 1 }}>{saving && <Spinner size={14} />}{editId ? t.update : t.create}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title={t.deleteDefault}
        message={lang === "en" ? "Are you sure you want to delete this recipe?" : "هل أنت متأكد من حذف هذه الوصفة؟"}
        confirmLabel={t.deleteDefault}
        onConfirm={confirmDeleteRecipe}
        onCancel={() => setConfirmDelete(null)}
        loading={saving}
      />
    </div>
  )
}
