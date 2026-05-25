"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, LogOut, Menu, X, AlertCircle, LayoutDashboard, Package, Tags, ShoppingCart, ArrowLeft, MessageSquare, BarChart3, Palette, FileText, MapPin, BookOpen, Languages, Eye, EyeOff, Gift } from "lucide-react"
import Link from "next/link"
import { STORAGE_KEYS } from "@/lib/constants"
import type { Product, Category, Order } from "@/lib/types"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"
import { Spinner } from "@/components/Spinner"
import { useDelayedLoading } from "@/lib/useDelayedLoading"
import { DashboardSection } from "./DashboardSection"
import { ProductsSection } from "./ProductsSection"
import { CategoriesSection } from "./CategoriesSection"
import { OrdersSection } from "./OrdersSection"
import { ContactsSection } from "./ContactsSection"
import { CustomersLoyaltySection } from "./CustomersLoyaltySection"
import { AppearanceSection } from "./AppearanceSection"
import { ContentSection } from "./ContentSection"
import { LocationsSection } from "./LocationsSection"
import { RecipesSection } from "./RecipesSection"
import { PromoCodesSection } from "./PromoCodesSection"
import { ConfirmDialog } from "./ConfirmDialog"

interface Contact {
  id: number; name: string; email: string; subject: string; message: string; file_url: string | null; created_at: string
}

const TABS = [
  ["dashboard", LayoutDashboard],
  ["products", Package],
  ["categories", Tags],
  ["orders", ShoppingCart],
  ["messages", MessageSquare],
  ["loyalty", BarChart3],
  ["locations", MapPin],
  ["recipes", BookOpen],
  ["appearance", Palette],
  ["content", FileText],
  ["promo", Gift],
] as const

export default function AdminPage() {
  const { lang, setLang } = useStore()
  const t = adminT[lang]
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [token, setToken] = useState("")
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState<"dashboard" | "products" | "categories" | "orders" | "messages" | "loyalty" | "locations" | "recipes" | "appearance" | "content" | "promo">("dashboard")
  const [mobileTabOpen, setMobileTabOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [customers, setCustomers] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const showLoadingSpinner = useDelayedLoading(loading, 300)
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
    if (valid) setTab(hash as typeof tab) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  // Sync tab to URL hash
  useEffect(() => {
    window.location.hash = tab
  }, [tab])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c, o, msg, cust] = await Promise.all([
        fetch("/api/products").then(r => { if (!r.ok) throw new Error("Failed to load products"); return r.json() }),
        fetch("/api/categories").then(r => { if (!r.ok) throw new Error("Failed to load categories"); return r.json() }),
        fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
        fetch("/api/contact", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
        fetch("/api/admin/customers", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      ])
      if (Array.isArray(p)) setProducts(p)
      if (Array.isArray(c)) setCategories(c)
      if (Array.isArray(o)) setOrders(o)
      if (Array.isArray(msg)) setContacts(msg)
      if (Array.isArray(cust)) setCustomers(cust.length)
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Failed to load data")
    } finally { setLoading(false) }
  }, [token, showToast])

  useEffect(() => { if (authenticated) loadData() }, [authenticated, loadData]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!password.trim()) { setLoginError(t.passwordRequired); return }
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (data.success) {
        setToken(data.token); setAuthenticated(true)
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.token)
      } else setLoginError(data.error || t.invalidPassword)
    } catch { setLoginError(t.connectionError) }
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--bg) 0%, var(--surface) 50%, var(--bg) 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 75% 75%, var(--accent) 0%, transparent 50%)`,
        }} />
        <form onSubmit={handleLogin}
          className="relative w-full max-w-sm p-8 rounded-2xl animate-fade-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
          }}>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--accent)" }}>
              <Shield size={22} color="#fff" />
            </div>
            <h1 className="text-lg font-bold">{t.adminLogin}</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Enter your password to continue" : "أدخل كلمة المرور للمتابعة"}</p>
          </div>
          {loginError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4" style={{ background: "rgba(239,68,68,0.1)", color: "var(--accent)" }} role="alert">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}
          <div className="relative mb-5">
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder={t.password} autoFocus aria-label={t.password}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm pr-11 transition-all duration-200 focus:ring-2"
              style={{
                background: "var(--surface-2)", color: "var(--text-primary)",
                border: "1px solid var(--border)",
                "--tw-ring-color": "var(--accent)",
              } as React.CSSProperties} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center min-touch" style={{ color: "var(--text-muted)" }} aria-label={showPassword ? t.hidePassword : t.showPassword}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm min-touch transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#fff" }}>
            {loading ? t.loggingIn : t.login}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }} dir={lang === "ar" ? "rtl" : undefined}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 py-2.5 backdrop-blur-xl" style={{ background: "rgba(var(--surface-rgb, 255,255,255), 0.85)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-surface-2" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={14} /> <span className="hidden sm:inline">{t.back}</span>
          </Link>
          <div className="w-px h-5" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <Shield size={14} color="#fff" />
            </div>
            <span className="font-bold text-sm">{t.adminPanel}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold min-touch transition-colors hover:bg-surface-2 flex items-center gap-1.5"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
            title={lang === "en" ? "العربية" : "English"} aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}>
            <Languages size={12} />{lang === "en" ? "AR" : "EN"}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
            <span>{products.length} {lang === "en" ? "prod" : "منتج"}</span>
            <span className="w-px h-3" style={{ background: "var(--border)" }} />
            <span>{orders.length} {lang === "en" ? "ord" : "طلب"}</span>
          </div>
          <button onClick={() => setConfirmLogout(true)}
            className="p-2 rounded-lg min-touch transition-colors hover:bg-surface-2 flex items-center justify-center"
            style={{ color: "var(--text-muted)" }} title={t.logout} aria-label={t.logout}>
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:flex items-center gap-1 px-4 sm:px-6 py-3 overflow-x-auto" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map(([key, Icon]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium whitespace-nowrap rounded-xl transition-all duration-150"
            style={{
              color: tab === key ? "#fff" : "var(--text-secondary)",
              background: tab === key ? "var(--accent)" : "transparent",
              boxShadow: tab === key ? "0 2px 12px rgba(0,0,0,0.12)" : "none",
            }}>
            <Icon size={15} /> {(t as Record<string, string>)[key]}
          </button>
        ))}
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden">
        <button onClick={() => setMobileTabOpen(!mobileTabOpen)}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium min-touch transition-colors"
          style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", background: mobileTabOpen ? "var(--surface-2)" : "transparent" }}>
          {mobileTabOpen ? <X size={16} /> : <Menu size={16} />}
          {(t as Record<string, string>)[TABS.find(([k]) => k === tab)?.[0] || ""] || tab}
        </button>
        {mobileTabOpen && (
          <>
            <div className="fixed inset-0 z-30" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setMobileTabOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl overflow-hidden animate-slide-up" style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "70vh" }}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Navigate" : "التنقل"}</span>
                <button onClick={() => setMobileTabOpen(false)} className="p-1 rounded-lg hover:bg-surface-2" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
              </div>
              <div className="overflow-y-auto p-2 space-y-0.5">
                {TABS.map(([key, Icon]) => (
                  <button key={key} onClick={() => { setTab(key as typeof tab); setMobileTabOpen(false) }}
                    className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: tab === key ? "#fff" : "var(--text-secondary)",
                      background: tab === key ? "var(--accent)" : "transparent",
                    }}>
                    <Icon size={16} /> {(t as Record<string, string>)[key]}
                    {tab === key && <span className="ml-auto text-[10px] opacity-70">{lang === "en" ? "Active" : "نشط"}</span>}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Logout confirmation */}
      <ConfirmDialog
        open={confirmLogout}
        title={t.logout}
        message={t.logoutConfirm}
        confirmLabel={t.logout}
        danger={false}
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm shadow-2xl animate-slide-up"
          style={{
            background: toast.type === "success"
              ? "linear-gradient(135deg, #065F46, #047857)"
              : "linear-gradient(135deg, #7F1D1D, #991B1B)",
            color: "#fff",
            maxWidth: 380,
          }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
            {toast.type === "success" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <AlertCircle size={14} />
            )}
          </div>
          <span className="flex-1 text-[13px] font-medium">{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-white/10 min-touch flex items-center justify-center" aria-label={t.closeNotification}><X size={14} /></button>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {showLoadingSpinner && (
          <div className="flex items-center justify-center py-16">
            <Spinner size={24} />
          </div>
        )}

        {!loading && tab === "dashboard" && (
          <DashboardSection products={products} categories={categories} orders={orders} customersCount={customers} messagesCount={contacts.length} token={token} showToast={showToast} onRefresh={loadData} />
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
        {!loading && tab === "locations" && (
          <LocationsSection token={token} />
        )}
        {!loading && tab === "recipes" && (
          <RecipesSection token={token} showToast={showToast} />
        )}
        {!loading && tab === "appearance" && (
          <AppearanceSection token={token} showToast={showToast} />
        )}
        {!loading && tab === "content" && (
          <ContentSection token={token} showToast={showToast} />
        )}
        {!loading && tab === "promo" && (
          <PromoCodesSection token={token} showToast={showToast} />
        )}
      </div>
    </div>
  )
}