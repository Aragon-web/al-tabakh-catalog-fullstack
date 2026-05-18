"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import type { Product, Category, Order } from "@/lib/types"
import { Shield, Package, Tags, ShoppingCart, Bell, LogOut, Plus, Edit3, Trash2, Upload, RefreshCw } from "lucide-react"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"dashboard" | "products" | "categories" | "orders">("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const saved = localStorage.getItem("altabakh_admin_token")
    if (saved) { setToken(saved); setAuthenticated(true) }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    loadData()
  }, [authenticated])

  async function loadData() {
    const [p, c, o] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    ])
    if (p.data) setProducts(p.data)
    if (c.data) setCategories(c.data)
    if (o.data) setOrders(o.data)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
    const data = await res.json()
    if (data.success) {
      setToken(data.token)
      setAuthenticated(true)
      localStorage.setItem("altabakh_admin_token", data.token)
    } else {
      setError("Invalid password")
    }
  }

  function handleLogout() {
    setToken(""); setAuthenticated(false)
    localStorage.removeItem("altabakh_admin_token")
  }

  async function saveProduct() {
    if (!editProduct) return
    const isNew = !products.find(p => p.id === editProduct.id)
    const res = isNew
      ? await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editProduct) })
      : await fetch(`/api/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editProduct) })
    if (res.ok) { setEditProduct(null); loadData() }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    loadData()
  }

  async function saveCategory() {
    if (!editCategory) return
    const isNew = !categories.find(c => c.id === editCategory.id)
    const res = isNew
      ? await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editCategory) })
      : await fetch(`/api/categories/${editCategory.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editCategory) })
    if (res.ok) { setEditCategory(null); loadData() }
  }

  async function deleteCategory(id: string) {
    if (id === "all") return alert("Cannot delete 'All Products'")
    if (!confirm("Delete this category? Products will be moved to 'All Products'")) return
    await fetch(`/api/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    loadData()
  }

  async function runSeed() {
    setSeeding(true)
    const res = await fetch("/api/seed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
    const data = await res.json()
    alert(data.message || data.error)
    setSeeding(false)
    loadData()
  }

  if (!mounted) return null

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <form onSubmit={handleLogin} className="p-8 rounded-2xl w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} style={{ color: "var(--accent)" }} />
            <h1 className="text-xl font-bold">Admin Login</h1>
          </div>
          {error && <p className="text-sm mb-3" style={{ color: "var(--accent)" }}>{error}</p>}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg mb-4 outline-none"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            autoFocus
          />
          <button type="submit" className="w-full py-2.5 rounded-lg font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <Shield size={20} style={{ color: "var(--accent)" }} />
          <span className="font-bold">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{products.length} products</span>
          <button onClick={handleLogout} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}><LogOut size={16} /></button>
        </div>
      </div>

      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {([["dashboard", "Dashboard"], ["products", "Products"], ["categories", "Categories"], ["orders", "Orders"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="px-6 py-3 text-sm font-medium transition-colors" style={{
            color: tab === key ? "var(--accent)" : "var(--text-secondary)",
            borderBottom: tab === key ? "2px solid var(--accent)" : "2px solid transparent"
          }}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Package, label: "Products", count: products.length, color: "var(--accent)" },
                { icon: Tags, label: "Categories", count: categories.length, color: "#3B82F6" },
                { icon: ShoppingCart, label: "Orders", count: orders.length, color: "#25D366" },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <s.icon size={20} style={{ color: s.color }} />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                  </div>
                  <span className="text-2xl font-bold">{s.count}</span>
                </div>
              ))}
            </div>
            <button onClick={runSeed} disabled={seeding} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
              {seeding ? "Seeding..." : "Import 481 products from API"}
            </button>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Products ({products.length})</h2>
              <button onClick={() => setEditProduct({ id: "", category_id: "all", name_en: "", name_ar: "", desc_en: "", desc_ar: "", weight: "", pieces_per_carton: "", price: 0, image_url: "", is_new: false, is_featured: false, created_at: "", updated_at: "" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm" style={{ background: "var(--accent)", color: "#fff" }}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {products.slice(0, 200).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                    {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.display = "none"} /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name_en}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{p.name_ar}</p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>{formatPrice(p.price)}</span>
                  <button onClick={() => setEditProduct(p)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }}><Edit3 size={14} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Categories ({categories.length})</h2>
              <button onClick={() => setEditCategory({ id: "", name_en: "", name_ar: "", icon: "", sort_order: 0, created_at: "" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm" style={{ background: "var(--accent)", color: "#fff" }}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-sm font-medium">{c.name_en}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.name_ar}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{products.filter(p => p.category_id === c.id).length} products</span>
                    {c.id !== "all" && <>
                      <button onClick={() => setEditCategory(c)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }}><Edit3 size={14} /></button>
                      <button onClick={() => deleteCategory(c.id)} className="p-1.5 rounded" style={{ color: "var(--text-muted)" }}><Trash2 size={14} /></button>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>No orders yet</p>
            ) : (
              orders.slice(0, 50).map(o => (
                <div key={o.id} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{o.id.slice(0, 8)}...</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    {o.items.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name_en} x{item.quantity}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {o.items.length > 5 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>...and {o.items.length - 5} more</p>}
                  </div>
                  <div className="flex justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <span className="font-bold">Total</span>
                    <span className="font-bold" style={{ color: "var(--accent)" }}>{formatPrice(o.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Product Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" style={{ background: "var(--surface)" }}>
            <h3 className="text-lg font-bold mb-4">{editProduct.id ? "Edit Product" : "Add Product"}</h3>
            <div className="space-y-3">
              <input placeholder="Product ID" value={editProduct.id} onChange={e => setEditProduct({ ...editProduct, id: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Name (EN)" value={editProduct.name_en} onChange={e => setEditProduct({ ...editProduct, name_en: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder="Name (AR)" value={editProduct.name_ar} onChange={e => setEditProduct({ ...editProduct, name_ar: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Weight" value={editProduct.weight} onChange={e => setEditProduct({ ...editProduct, weight: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder="Pieces/Carton" value={editProduct.pieces_per_carton} onChange={e => setEditProduct({ ...editProduct, pieces_per_carton: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <input placeholder="Price" type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input placeholder="Image URL" value={editProduct.image_url} onChange={e => setEditProduct({ ...editProduct, image_url: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <select value={editProduct.category_id || "all"} onChange={e => setEditProduct({ ...editProduct, category_id: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditProduct(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={saveProduct} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {editCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: "var(--surface)" }}>
            <h3 className="text-lg font-bold mb-4">{editCategory.id ? "Edit Category" : "Add Category"}</h3>
            <div className="space-y-3">
              <input placeholder="Category ID (slug)" value={editCategory.id} onChange={e => setEditCategory({ ...editCategory, id: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Name (EN)" value={editCategory.name_en} onChange={e => setEditCategory({ ...editCategory, name_en: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder="Name (AR)" value={editCategory.name_ar} onChange={e => setEditCategory({ ...editCategory, name_ar: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditCategory(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={saveCategory} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
