"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { ShoppingCart, Menu, X, Globe } from "lucide-react"
import Link from "next/link"
import { CartDrawer } from "./CartDrawer"

export function Header() {
  const { lang, setLang, cartCount, search, setSearch } = useStore()
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const t = {
    en: { search: "Search products...", cart: "Cart", orders: "Orders", admin: "Admin" },
    ar: { search: "ابحث عن المنتجات...", cart: "السلة", orders: "الطلبات", admin: "لوحة التحكم" },
  }[lang]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 safe-top" style={{ background: "var(--navbar)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="text-lg sm:text-xl font-bold flex-shrink-0" style={{ color: "var(--accent)" }}>
            Al‑Tabakh
          </Link>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full px-4 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
          </div>

          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
            >
              <Globe size={14} /> {lang === "en" ? "AR" : "EN"}
            </button>
            <Link href="/orders" className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
              {t.orders}
            </Link>
            <Link href="/admin" className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
              {t.admin}
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative p-2 min-touch flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--surface-2)" }}>
              <ShoppingCart size={18} style={{ color: "var(--text-primary)" }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          <button className="md:hidden p-2 min-touch flex items-center justify-center" onClick={() => setMobileMenu(!mobileMenu)} style={{ color: "var(--text-primary)" }}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="md:hidden px-3 sm:px-4 pb-2.5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
        </div>

        {mobileMenu && (
          <div className="md:hidden px-3 sm:px-4 pb-4 flex flex-col gap-1" style={{ background: "var(--surface)" }}>
            <button onClick={() => { setLang(lang === "en" ? "ar" : "en"); setMobileMenu(false) }} className="flex items-center gap-2 py-2.5 text-sm min-touch" style={{ color: "var(--text-secondary)" }}>
              <Globe size={16} /> {lang === "en" ? "العربية" : "English"}
            </button>
            <Link href="/orders" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.orders}</Link>
            <Link href="/admin" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.admin}</Link>
            <button onClick={() => { setCartOpen(true); setMobileMenu(false) }} className="flex items-center gap-2 py-2.5 text-sm min-touch" style={{ color: "var(--text-secondary)" }}>
              <ShoppingCart size={16} /> {t.cart} ({cartCount})
            </button>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
