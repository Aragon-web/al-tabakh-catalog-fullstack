"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useFocusTrap } from "@/lib/useFocusTrap"
import { Plus, Edit3, Trash2, X, Loader2, GripVertical, Search, Check, ArrowUpDown } from "lucide-react"
import type { Category, Product } from "@/lib/types"
import { ConfirmDialog } from "./ConfirmDialog"
import { UploadDropzone } from "./UploadDropzone"
import { slugify } from "@/lib/slugify"

interface Props {
  categories: Category[]
  products: Product[]
  token: string
  showToast: (type: "success" | "error", text: string) => void
  onRefresh: () => void
}

export function CategoriesSection({ categories, products, token, showToast, onRefresh }: Props) {
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addSearch, setAddSearch] = useState("")
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [productOrder, setProductOrder] = useState<Record<string, number>>({})
  const catEditTrapRef = useFocusTrap(!!editCategory)
  const addProductsTrapRef = useFocusTrap(!!showAddModal && !!expandedCat)

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(sets => {
        const o = sets.find((s: { key: string }) => s.key === "product_order")
        if (o?.value) setProductOrder(o.value as Record<string, number>)
      })
      .catch(() => {})
  }, [products]) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = categories.filter(c => c.id !== "all")

  useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1
    }
    return counts
  }, [products])

  function newCategory() {
    setEditCategory({ id: "", name_en: "", name_ar: "", icon: "", image_url: "", sort_order: 0, created_at: "" })
  }

  async function saveCategory() {
    if (!editCategory) return
    if (!editCategory.id || (!editCategory.name_en && !editCategory.name_ar)) {
      showToast("error", "Category ID and name are required"); return
    }
    setSaving(true)
    try {
      const exists = categories.find(c => c.id === editCategory.id)
      const url = exists ? `/api/categories/${editCategory.id}` : "/api/categories"
      const method = exists ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editCategory) })
      if (res.ok) {
        setEditCategory(null)
        showToast("success", exists ? "Category updated" : "Category created")
        onRefresh()
      } else { const err = await res.json(); showToast("error", err.error || "Failed to save") }
    } catch { showToast("error", "Network error") }
    setSaving(false)
  }

  async function deleteCategory(id: string) {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { showToast("success", "Category deleted"); onRefresh() }
      else { const err = await res.json(); showToast("error", err.error || "Delete failed") }
    } catch { showToast("error", "Network error") }
    setConfirmDelete(null)
  }

  async function moveProducts(catId: string, pIds: string[]) {
    const res = await fetch("/api/products/batch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "move", product_ids: pIds, category_id: catId }),
    })
    if (!res.ok) throw new Error("Move failed")
  }

  async function reorder(catId: string, items: { id: string; sort_order: number }[]) {
    const res = await fetch("/api/products/batch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "reorder", reorder: items }),
    })
    if (!res.ok) throw new Error("Reorder failed")
  }

  async function handleAddToCategory(catId: string) {
    const ids = Array.from(addingIds)
    if (ids.length === 0) return
    try {
      await moveProducts(catId, ids)
      showToast("success", `${ids.length} product(s) added`)
      setAddingIds(new Set())
      setShowAddModal(false)
      onRefresh()
    } catch { showToast("error", "Failed to add products") }
  }

  async function handleRemoveFromCategory() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      await moveProducts("all", ids)
      showToast("success", `${ids.length} product(s) removed`)
      setSelectedIds(new Set())
      onRefresh()
    } catch { showToast("error", "Failed to remove products") }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragItem(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(id)
  }

  const handleDragLeave = () => setDragOver(null)

  const handleDrop = async (e: React.DragEvent, catId: string, targetId: string) => {
    e.preventDefault()
    setDragOver(null)
    const sourceId = dragItem || e.dataTransfer.getData("text/plain")
    if (!sourceId || sourceId === targetId) { setDragItem(null); return }

    const catProducts = products
      .filter(p => p.category_id === catId)
      .sort((a, b) => {
        const oa = productOrder[a.id] ?? 999
        const ob = productOrder[b.id] ?? 999
        return oa - ob
      })

    const idx = catProducts.findIndex(p => p.id === sourceId)
    const tIdx = catProducts.findIndex(p => p.id === targetId)
    if (idx === -1 || tIdx === -1) { setDragItem(null); return }

    const reordered = [...catProducts]
    const [moved] = reordered.splice(idx, 1)
    reordered.splice(tIdx, 0, moved)

    const updates = reordered.map((p, i) => ({ id: p.id, sort_order: i }))
    try {
      await reorder(catId, updates)
      setDragItem(null)
      onRefresh()
    } catch { showToast("error", "Failed to reorder") }
  }

  const catProducts = useCallback((catId: string) =>
    products.filter(p => p.category_id === catId).sort((a, b) => {
      const oa = productOrder[a.id] ?? 999
      const ob = productOrder[b.id] ?? 999
      return oa - ob
    }),
  [products, productOrder])

  const uncategorized = useMemo(() =>
    products.filter(p => !p.category_id || p.category_id === "all"),
  [products])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold">Categories ({categories.length})</h2>
        <button onClick={newCategory} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-1.5">
        {visible.map(c => {
          const items = catProducts(c.id)
          const expanded = expandedCat === c.id
          return (
            <div key={c.id}>
              <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <button onClick={() => setExpandedCat(expanded ? null : c.id)} className="p-1 rounded transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none", color: "var(--text-muted)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                  {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.display = "none"} alt="" /> : null} {/* eslint-disable-line @next/next/no-img-element */}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name_en}</p>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>{c.name_ar}</span>
                    <span>·</span>
                    <span>Slug: {slugify(c.name_en)}</span>
                    <span>·</span>
                    <span>{items.length} products</span>
                  </div>
                </div>
                <button onClick={() => { setExpandedCat(c.id); setShowAddModal(true) }} className="p-1.5 rounded text-xs flex items-center gap-1" style={{ color: "var(--accent)" }}>
                  <Plus size={12} /> Add
                </button>
                <button onClick={() => setEditCategory(c)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }} aria-label="Edit category"><Edit3 size={13} /></button>
                <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }} aria-label="Delete category"><Trash2 size={13} /></button>
              </div>

              {/* Expanded product list */}
              {expanded && (
                <div className="ml-6 mt-1 rounded-lg overflow-hidden" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{items.length} product(s)</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowAddModal(true)} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ color: "var(--accent)" }}>
                        <Plus size={11} /> Add
                      </button>
                      {selectedIds.size > 0 && (
                        <button onClick={() => handleRemoveFromCategory()} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ color: "#EF4444" }}>
                          <X size={11} /> Remove ({selectedIds.size})
                        </button>
                      )}
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No products in this category</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {items.map(p => {
                        const nameEn = p.name_en || p.name_ar
                        return (
                          <div key={p.id}
                            draggable
                            onDragStart={e => handleDragStart(e, p.id)}
                            onDragOver={e => handleDragOver(e, p.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, c.id, p.id)}
                            className="flex items-center gap-2 px-3 py-2 transition-colors"
                            style={{
                              background: dragOver === p.id ? "var(--surface-3)" : "transparent",
                              borderBottom: "1px solid var(--border)",
                              opacity: dragItem === p.id ? 0.5 : 1,
                            }}>
                            <div className="cursor-grab active:cursor-grabbing touch-none" style={{ color: "var(--text-muted)" }}>
                              <GripVertical size={13} />
                            </div>
                            <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0" style={{ background: "var(--surface)" }}>
                              {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: "var(--text-muted)" }}>{nameEn.charAt(0)}</div>} {/* eslint-disable-line @next/next/no-img-element */}
                            </div>
                            <span className="text-xs flex-1 truncate">{nameEn}</span>
                            <input type="checkbox" checked={selectedIds.has(p.id)}
                              onChange={e => {
                                const next = new Set(selectedIds)
                                if (e.target.checked) next.add(p.id); else next.delete(p.id)
                                setSelectedIds(next)
                              }}
                              className="w-3.5 h-3.5 rounded cursor-pointer accent-current" style={{ accentColor: "var(--accent)" }} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Uncategorized section */}
      {uncategorized.length > 0 && (
        <div className="mt-4 p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}>
          <p className="text-xs font-medium flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <ArrowUpDown size={12} /> Uncategorized ({uncategorized.length})
          </p>
        </div>
      )}

      {/* Category edit modal */}
      {editCategory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => !saving && setEditCategory(null)} onKeyDown={e => { if (e.key === "Escape" && !saving) setEditCategory(null) }} role="dialog" aria-modal="true" tabIndex={-1}>
          <div ref={catEditTrapRef} className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-4 sm:p-6" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{categories.find(c => c.id === editCategory.id) ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => !saving && setEditCategory(null)} className="p-1 rounded" style={{ color: "var(--text-muted)" }} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Category ID *" value={editCategory.id} onChange={e => setEditCategory({ ...editCategory, id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" aria-label="Category ID" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              {editCategory.name_en && (
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Slug: /category/{slugify(editCategory.name_en)}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Name (EN) *" value={editCategory.name_en} onChange={e => setEditCategory({ ...editCategory, name_en: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label="Category name English" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder="Name (AR) *" value={editCategory.name_ar} onChange={e => setEditCategory({ ...editCategory, name_ar: e.target.value })}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none" aria-label="Category name Arabic" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div className="space-y-2">
                <UploadDropzone currentUrl={editCategory.image_url || ""} onUpload={(url) => setEditCategory({...editCategory, image_url: url})} token={token} />
                <input placeholder="Image URL" value={editCategory.image_url || ""} onChange={e => setEditCategory({ ...editCategory, image_url: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" aria-label="Category image URL" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => !saving && setEditCategory(null)} className="flex-1 py-3 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={saveCategory} disabled={saving} className="flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5" style={{ background: "var(--accent)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Products Modal */}
      {showAddModal && expandedCat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => { setShowAddModal(false); setAddingIds(new Set()) }} onKeyDown={e => { if (e.key === "Escape") { setShowAddModal(false); setAddingIds(new Set()) } }} role="dialog" aria-modal="true" tabIndex={-1}>
          <div ref={addProductsTrapRef} className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col p-4 sm:p-6" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold">Add Products</h3>
              <button onClick={() => { setShowAddModal(false); setAddingIds(new Set()) }} className="p-1 rounded" style={{ color: "var(--text-muted)" }} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={addSearch} onChange={e => setAddSearch(e.target.value)} placeholder="Search products..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
              {(() => {
                const notInCat = products.filter(p => p.category_id !== expandedCat && (!p.category_id || p.category_id === "all"))
                const searched = addSearch ? notInCat.filter(p =>
                  p.name_en.toLowerCase().includes(addSearch.toLowerCase()) ||
                  p.name_ar.toLowerCase().includes(addSearch.toLowerCase())
                ) : notInCat
                if (searched.length === 0) {
                  return <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No products to add</p>
                }
                return searched.map(p => (
                  <label key={p.id}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{ background: addingIds.has(p.id) ? "var(--surface-3)" : "transparent" }}>
                    <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                      {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: "var(--text-muted)" }}>{p.name_en.charAt(0)}</div>} {/* eslint-disable-line @next/next/no-img-element */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name_en}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.name_ar}</p>
                    </div>
                    <input type="checkbox" checked={addingIds.has(p.id)}
                      onChange={e => {
                                        const next = new Set(addingIds)
                                        if (e.target.checked) next.add(p.id); else next.delete(p.id)
                                        setAddingIds(next)
                                      }}
                      className="w-4 h-4 rounded cursor-pointer accent-current" style={{ accentColor: "var(--accent)" }} />
                  </label>
                ))
              })()}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{addingIds.size} selected</span>
              <div className="flex gap-2">
                <button onClick={() => { setShowAddModal(false); setAddingIds(new Set()) }} className="px-4 py-2 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>Cancel</button>
                <button onClick={() => handleAddToCategory(expandedCat)} disabled={addingIds.size === 0}
                  className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: "var(--accent)", color: "#fff", opacity: addingIds.size === 0 ? 0.5 : 1 }}>
                  <Check size={12} /> Add ({addingIds.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Category"
        message="Products in this category will become uncategorized."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && deleteCategory(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}