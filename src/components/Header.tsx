"use client"

import { useState, useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import { categorySlug } from "@/lib/slugify"
import { ShoppingCart, Menu, X, Globe, ChevronDown, User, Search } from "lucide-react"
import Link from "next/link"
import { CartDrawer } from "./CartDrawer"

export function Header() {
  const { lang, setLang, cartCount, search, setSearch, categories, customer } = useStore()
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)
  const catBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        catOpen &&
        catRef.current &&
        !catRef.current.contains(e.target as Node) &&
        catBtnRef.current &&
        !catBtnRef.current.contains(e.target as Node)
      ) {
        setCatOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [catOpen])

  const t = {
    en: { search: "Search products...", cart: "Cart", orders: "Orders", categories: "Categories", faq: "FAQ", about: "About", sitemap: "Sitemap", contact: "Contact", campaign: "Campaigns", account: "My Account", locations: "Locations", recipes: "Recipes" },
    ar: { search: "ابحث عن المنتجات...", cart: "السلة", orders: "الطلبات", categories: "الأقسام", faq: "الأسئلة الشائعة", about: "من نحن", sitemap: "خريطة الموقع", contact: "اتصل بنا", campaign: "العروض", account: "حسابي", locations: "الفروع", recipes: "وصفات" },
  }[lang]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 safe-top" style={{ background: "var(--navbar)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="heading text-lg sm:text-xl font-bold flex-shrink-0" style={{ color: "var(--accent)" }}>
            Al‑Tabakh
          </Link>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.search}
                className="w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none transition-colors" aria-label={t.search}
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-touch flex items-center justify-center rounded" style={{ color: "var(--text-muted)" }} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <div className="relative">
              <button
                ref={catBtnRef}
                onClick={() => setCatOpen(!catOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors min-touch"
                style={{ background: catOpen ? "var(--surface-2)" : "transparent", color: "var(--text-secondary)" }}
              >
                {t.categories} <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div
                  ref={catRef}
                  className="absolute top-full right-0 mt-2 w-[480px] rounded-xl shadow-2xl overflow-hidden animate-fade-in"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {categories
                      .filter(c => c.id !== "all")
                      .map(cat => (
                        <Link
                          key={cat.id}
                          href={`/category/${categorySlug(cat)}`}
                        onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-surface-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                            {(lang === "en" ? cat.name_en : cat.name_ar).charAt(0)}
                          </div>
                          <span className="truncate">{lang === "en" ? cat.name_en : cat.name_ar}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors min-touch"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
            >
              <Globe size={14} /> {lang === "en" ? "AR" : "EN"}
            </button>
            <Link href="/orders" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors min-touch flex items-center" style={{ color: "var(--text-secondary)" }}>
              {t.orders}
            </Link>
            <Link href="/locations" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors hidden lg:inline-flex items-center min-touch" style={{ color: "var(--text-secondary)" }}>
              {t.locations}
            </Link>
            <Link href="/faq" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors hidden lg:inline-flex items-center min-touch" style={{ color: "var(--text-secondary)" }}>
              {t.faq}
            </Link>
            <Link href="/contact" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors hidden lg:inline-flex items-center min-touch" style={{ color: "var(--text-secondary)" }}>
              {t.contact}
            </Link>
            <Link href="/recipes" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors hidden lg:inline-flex items-center min-touch" style={{ color: "var(--text-secondary)" }}>
              {t.recipes}
            </Link>
            <Link href="/campaign" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors hidden lg:inline-flex items-center min-touch" style={{ color: "var(--text-secondary)" }}>
              {t.campaign}
            </Link>
            <Link href="/about" className="px-2.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors hidden lg:inline-flex items-center min-touch" style={{ color: "var(--text-secondary)" }}>
              {t.about}
            </Link>
            <Link href="/account/profile" className="p-2 min-touch flex items-center justify-center rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }} title={t.account}>
              <User size={16} />
              <span className="text-xs ml-1 hidden sm:inline">{customer ? customer.name.split(" ")[0] : t.account}</span>
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative p-2 min-touch flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--surface-2)" }} aria-label="Open cart">
              <ShoppingCart size={18} style={{ color: "var(--text-primary)" }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          <button className="md:hidden p-2 min-touch flex items-center justify-center" onClick={() => setMobileMenu(!mobileMenu)} style={{ color: "var(--text-primary)" }} aria-label={mobileMenu ? "Close menu" : "Open menu"}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="md:hidden px-3 sm:px-4 pb-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none" aria-label={t.search}
              style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-touch flex items-center justify-center rounded" style={{ color: "var(--text-muted)" }} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden px-3 sm:px-4 pb-4 flex flex-col gap-1" style={{ background: "var(--surface)" }}>
            <div className="py-2">
              <p className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-muted)" }}>{t.categories}</p>
              <div className="grid grid-cols-2 gap-1">
                {categories
                  .filter(c => c.id !== "all")
                  .map(cat => (
                    <Link
                      key={cat.id}
                       href={`/category/${categorySlug(cat)}`}
                      onClick={() => setMobileMenu(false)}
                      className="px-3 py-2 rounded-lg text-sm min-touch flex items-center"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                    >
                      {lang === "en" ? cat.name_en : cat.name_ar}
                    </Link>
                  ))}
              </div>
            </div>
            <button onClick={() => { setLang(lang === "en" ? "ar" : "en"); setMobileMenu(false) }} className="flex items-center gap-2 py-2.5 text-sm min-touch" style={{ color: "var(--text-secondary)" }}>
              <Globe size={16} /> {lang === "en" ? "العربية" : "English"}
            </button>
            <Link href="/orders" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.orders}</Link>
            <Link href="/locations" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.locations}</Link>
            <Link href="/recipes" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.recipes}</Link>
            <Link href="/campaign" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.campaign}</Link>
            <Link href="/contact" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.contact}</Link>
            <Link href="/faq" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.faq}</Link>
            <Link href="/about" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.about}</Link>
            <Link href="/sitemap" className="py-2.5 text-sm min-touch flex items-center" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>{t.sitemap}</Link>
            <Link href="/account/profile" className="py-2.5 text-sm min-touch flex items-center gap-2" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileMenu(false)}>
              <User size={16} /> {customer ? customer.name.split(" ")[0] : t.account}
            </Link>
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
