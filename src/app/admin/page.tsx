"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, LogOut, Menu, X, AlertCircle, LayoutDashboard, Package, Tags, ShoppingCart, Eye, EyeOff, ArrowLeft, MessageSquare, BarChart3, Palette, FileText, MapPin } from "lucide-react"
import Link from "next/link"
import { STORAGE_KEYS } from "@/lib/constants"
import type { Product, Category, Order } from "@/lib/types"
import { DashboardSection } from "./DashboardSection"
import { ProductsSection } from "./ProductsSection"
import { CategoriesSection } from "./CategoriesSection"
import { OrdersSection } from "./OrdersSection"
import { ContactsSection } from "./ContactsSection"
import { CustomersLoyaltySection } from "./CustomersLoyaltySection"
import { AppearanceSection } from "./AppearanceSection"
import { ContentSection } from "./ContentSection"
import { LocationsSection } from "./LocationsSection"
import { ConfirmDialog } from "./ConfirmDialog"

interface Contact {
  id: number; name: string; email: string; subject: string; message: string; file_url: string | null; created_at: string
}

const TABS = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["products", "Products", Package],
  ["categories", "Categories", Tags],
  ["orders", "Orders", ShoppingCart],
  ["messages", "Messages", MessageSquare],
  ["loyalty", "Loyalty", BarChart3],
  ["locations", "Locations", MapPin],
  ["appearance", "Appearance", Palette],
  ["content", "Content", FileText],
] as const

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [token, setToken] = useState("")
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState<"dashboard" | "products" | "categories" | "orders" | "messages" | "loyalty" | "locations" | "appearance" | "content">("dashboard")
  const [mobileTabOpen, setMobileTabOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), []) // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)
    if (saved) { setToken(saved); setAuthenticated(true) } // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  // Restore tab from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    const valid = TABS.some(([k]) => k === hash)
    if (valid) setTab(hash as typeof tab)
  }, [])

  // Sync tab to URL hash
  useEffect(() => {
    window.location.hash = tab
  }, [tab])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c, o, msg] = await Promise.all([
        fetch("/api/products").then(r => { if (!r.ok) throw new Error("Failed to load products"); return r.json() }),
        fetch("/api/categories").then(r => { if (!r.ok) throw new Error("Failed to load categories"); return r.json() }),
        fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
        fetch("/api/contact", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      ])
      if (Array.isArray(p)) setProducts(p)
      if (Array.isArray(c)) setCategories(c)
      if (Array.isArray(o)) setOrders(o)
      if (Array.isArray(msg)) setContacts(msg)
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Failed to load data")
    } finally { setLoading(false) }
  }, [token, showToast])

  useEffect(() => { if (authenticated) loadData() }, [authenticated, loadData]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!password.trim()) { setLoginError("Password is required"); return }
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (data.success) {
        setToken(data.token); setAuthenticated(true)
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.token)
      } else setLoginError(data.error || "Invalid password")
    } catch { setLoginError("Connection error") }
  }

  const handleLogout = () => {
    setToken(""); setAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN)
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
  }

  const doLogout = () => {
    setConfirmLogout(false)
    handleLogout()
  }

  if (!mounted) return null

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
        <form onSubmit={handleLogin} className="p-6 sm:p-8 rounded-2xl w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} style={{ color: "var(--accent)" }} />
            <h1 className="text-xl font-bold">Admin Login</h1>
          </div>
          {loginError && <p className="text-sm mb-3" style={{ color: "var(--accent)" }} role="alert">{loginError}</p>}
          <div className="relative mb-4">
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" autoFocus aria-label="Admin password"
              className="w-full px-4 py-3 rounded-lg outline-none text-sm pr-11"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center min-touch" style={{ color: "var(--text-muted)" }} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button type="submit" className="w-full py-3 rounded-lg font-medium text-sm min-touch" style={{ background: "var(--accent)", color: "#fff" }}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 text-xs sm:text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <Shield size={18} style={{ color: "var(--accent)" }} />
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>{products.length} prod · {orders.length} ord</span>
          <button onClick={() => setConfirmLogout(true)} className="p-2.5 min-touch rounded-lg flex items-center justify-center" style={{ color: "var(--text-muted)" }} title="Logout" aria-label="Logout"><LogOut size={15} /></button>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:flex border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
        {TABS.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              color: tab === key ? "var(--accent)" : "var(--text-secondary)",
              borderBottom: tab === key ? "2px solid var(--accent)" : "2px solid transparent",
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => setMobileTabOpen(!mobileTabOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full min-touch"
          style={{ background: "var(--surface-2)" }}>
          {mobileTabOpen ? <X size={16} /> : <Menu size={16} />}
          {TABS.find(([k]) => k === tab)?.[1] || tab}
        </button>
        {mobileTabOpen && (
          <div className="mt-1 rounded-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {TABS.map(([key, label, Icon]) => (
              <button key={key} onClick={() => { setTab(key as typeof tab); setMobileTabOpen(false) }}
                className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm"
                style={{ color: tab === key ? "var(--accent)" : "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout confirmation */}
      <ConfirmDialog
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        danger={false}
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm shadow-lg"
          style={{ background: toast.type === "success" ? "#065F46" : "#7F1D1D", color: "#fff" }}>
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="flex-1">{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-2.5 min-touch flex items-center justify-center" aria-label="Close notification"><X size={14} /></button>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        )}

        {!loading && tab === "dashboard" && (
          <DashboardSection products={products} categories={categories} orders={orders} token={token} showToast={showToast} onRefresh={loadData} />
        )}
        {!loading && tab === "products" && (
          <ProductsSection products={products} categories={categories} token={token} showToast={showToast} onRefresh={loadData} />
        )}
        {!loading && tab === "categories" && (
          <CategoriesSection categories={categories} products={products} token={token} showToast={showToast} onRefresh={loadData} />
        )}
        {!loading && tab === "orders" && (
          <OrdersSection orders={orders} token={token} showToast={showToast} onRefresh={loadData} />
        )}
        {!loading && tab === "messages" && (
          <ContactsSection contacts={contacts} />
        )}
        {!loading && tab === "loyalty" && (
          <CustomersLoyaltySection token={token} showToast={showToast} />
        )}
        {tab === "locations" && (
          <LocationsSection token={token} />
        )}
        {tab === "appearance" && (
          <AppearanceSection token={token} showToast={showToast} />
        )}
        {tab === "content" && (
          <ContentSection token={token} showToast={showToast} />
        )}
      </div>
    </div>
  )
}