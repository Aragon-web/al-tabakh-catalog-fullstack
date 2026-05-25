"use client"

import { useState, useMemo } from "react"
import { useFocusTrap } from "@/lib/useFocusTrap"
import { Plus, Edit3, Trash2, Search, X, Check } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import type { Product, Category } from "@/lib/types"
import { ConfirmDialog } from "./ConfirmDialog"
import { UploadDropzone } from "./UploadDropzone"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface Props {
  products: Product[]
  categories: Category[]
  token: string
  showToast: (type: "success" | "error", text: string) => void
  onRefresh: () => void
}

function generateId() {
  return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const PAGE_SIZE = 25

export function ProductsSection({ products, categories, token, showToast, onRefresh }: Props) {
  const { lang } = useStore(); const t = adminT[lang]
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const productTrapRef = useFocusTrap(!!editProduct)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (catFilter !== "all" && p.category_id !== catFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!p.name_en.toLowerCase().includes(q) && !p.name_ar.includes(q)) return false
      }
      return true
    })
  }, [products, search, catFilter])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const catMap = useMemo(() => {
    const m = new Map(categories.map(c => [c.id, c]))
    return m
  }, [categories])

function newProduct() {
    const catId = categories.length > 0 ? categories[0].id : "all"
    setEditProduct({
      id: generateId(), category_id: catId,
      name_en: "", name_ar: "", desc_en: "", desc_ar: "",
      weight: "", pieces_per_carton: "",
      image_url: "", is_new: false, is_featured: false, stock: null,
      sort_order: 0, created_at: "", updated_at: "",
    })
  }

  async function saveProduct() {
    if (!editProduct) return
    if (!editProduct.name_en && !editProduct.name_ar) {
      showToast("error", "Product name is required"); return
    }
    setSaving(true)
    try {
      const exists = products.find(p => p.id === editProduct.id)
      const url = exists ? `/api/products/${editProduct.id}` : "/api/products"
      const method = exists ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editProduct) })
      if (res.ok) {
        setEditProduct(null)
        showToast("success", exists ? t.productUpdated : t.productCreated)
        onRefresh()
      } else {
        const err = await res.json()
        showToast("error", err.error || t.failedToSave)
      }
    } catch { showToast("error", t.networkError) }
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { showToast("success", "Product deleted"); onRefresh() }
      else { const err = await res.json(); showToast("error", err.error || t.failedToSave) }
    } catch { showToast("error", t.networkError) }
    setConfirmDelete(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold">{t.products} ({filtered.length})</h2>
        <button onClick={newProduct} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> {t.add}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder={t.searchByName} value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none" aria-label={t.searchByName}
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 rounded-lg text-sm outline-none max-w-[160px]"
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
          <option value="all">{t.allCategories}</option>
          {categories.filter(c => c.id !== "all").map(c => (
            <option key={c.id} value={c.id}>{c.name_en}</option>
          ))}
        </select>
      </div>

      {/* Product list */}
      <div className="space-y-1.5 max-h-[65vh] overflow-y-auto">
        {paged.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>{t.noProducts}</p>
        ) : paged.map(p => {
          const cat = catMap.get(p.category_id || "")
          return (
            <div key={p.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.display = "none"} alt="" loading="lazy" /> : null} {/* eslint-disable-line @next/next/no-img-element */}
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium truncate">{p.name_en}</p>
                    {p.is_new && <span className="text-[9px] px-1 py-0.5 rounded font-bold flex-shrink-0" style={{ background: "var(--accent)", color: "#fff" }}>{t.newBadge}</span>}
                  {p.stock === 0 && <span className="text-[9px] px-1 py-0.5 rounded font-bold flex-shrink-0" style={{ background: "#EF4444", color: "#fff" }}>{t.oosBadge}</span>}
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span>{cat?.name_en || "—"}</span>
                  {p.stock != null && <span>Stock: {p.stock}</span>}
                </div>
                </div>
                <button onClick={() => setEditProduct(p)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }} aria-label={t.editProduct}><Edit3 size={13} /></button>
              <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }} aria-label={t.deleteProduct}><Trash2 size={13} /></button>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page === 0 ? 0.4 : 1 }}>{t.prev}</button>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.pageOf} {page + 1} / {pageCount}</span>
          <button onClick={() => setPage(Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1}
            className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page >= pageCount - 1 ? 0.4 : 1 }}>{t.next}</button>
        </div>
      )}

      {/* Product edit modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => !saving && setEditProduct(null)} onKeyDown={e => { if (e.key === "Escape" && !saving) setEditProduct(null) }} role="dialog" aria-modal="true" tabIndex={-1}>
          <div ref={productTrapRef} className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{products.find(p => p.id === editProduct.id) ? t.editProduct : t.addProduct}</h3>
              <button onClick={() => !saving && setEditProduct(null)} className="p-1 rounded" style={{ color: "var(--text-muted)" }} aria-label={t.cancel}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder={t.nameEn} value={editProduct.name_en} onChange={e => setEditProduct({ ...editProduct, name_en: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.nameEn} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder={t.nameAr} value={editProduct.name_ar} onChange={e => setEditProduct({ ...editProduct, name_ar: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.nameAr} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder={t.descEn} value={editProduct.desc_en} onChange={e => setEditProduct({ ...editProduct, desc_en: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.descEn} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder={t.descAr} value={editProduct.desc_ar} onChange={e => setEditProduct({ ...editProduct, desc_ar: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.descAr} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder={t.weight} value={editProduct.weight} onChange={e => setEditProduct({ ...editProduct, weight: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.weight} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder={t.pcsCarton} value={editProduct.pieces_per_carton} onChange={e => setEditProduct({ ...editProduct, pieces_per_carton: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.pcsCarton} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder={t.stock} type="number" min="0" value={editProduct.stock ?? ""} onChange={e => setEditProduct({ ...editProduct, stock: e.target.value === "" ? null : parseInt(e.target.value) || 0 })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.stock} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div className="space-y-2">
                <UploadDropzone currentUrl={editProduct.image_url} onUpload={(url) => setEditProduct({...editProduct, image_url: url})} token={token} />
                <input placeholder={t.imageUrl} value={editProduct.image_url} onChange={e => setEditProduct({ ...editProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.imageUrl} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <select value={editProduct.category_id || "all"} onChange={e => setEditProduct({ ...editProduct, category_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.category} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editProduct.is_new} onChange={e => setEditProduct({ ...editProduct, is_new: e.target.checked })} />
                  {editProduct.is_new ? <Check size={14} style={{ color: "var(--accent)" }} /> : <div className="w-3.5 h-3.5 rounded" style={{ border: "1px solid var(--border)" }} />}
                  {t.newBadge}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editProduct.is_featured} onChange={e => setEditProduct({ ...editProduct, is_featured: e.target.checked })} />
                  {editProduct.is_featured ? <Check size={14} style={{ color: "var(--accent)" }} /> : <div className="w-3.5 h-3.5 rounded" style={{ border: "1px solid var(--border)" }} />}
                  Featured
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => !saving && setEditProduct(null)} className="flex-1 py-3 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>{t.cancel}</button>
              <button onClick={saveProduct} disabled={saving} className="flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5" style={{ background: "var(--accent)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
                {saving && <Spinner size={14} />}
                {saving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={t.deleteProduct}
        message={t.deleteConfirm}
        confirmLabel={t.deleteDefault}
        onConfirm={() => confirmDelete && deleteProduct(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}



