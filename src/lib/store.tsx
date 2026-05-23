"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from "react"
import type { Product, CartItem, Category } from "./types"
import { STORAGE_KEYS } from "./constants"
import Fuse from "fuse.js"

interface StoreState {
  products: Product[]
  categories: Category[]
  cart: CartItem[]
  lang: "en" | "ar"
  search: string
  selectedCategory: string
  customer: { id: number; name: string; email: string; phone: string | null; points: number } | null
  setLang: (lang: "en" | "ar") => void
  setSearch: (s: string) => void
  setSelectedCategory: (id: string) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  cartCount: number
  cartIds: Set<string>
  filteredProducts: Product[]
  logout: () => void
  refreshCustomer: () => void
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children, products, categories }: { children: ReactNode; products: Product[]; categories: Category[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [lang, setLang] = useState<"en" | "ar">("ar")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [customer, setCustomer] = useState<{ id: number; name: string; email: string; phone: string | null; points: number } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const refreshCustomer = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN)
    if (!token) { setCustomer(null); return }
    try {
      const res = await fetch("/api/customers/me", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setCustomer(data)
      } else {
        localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN)
        setCustomer(null)
      }
    } catch { setCustomer(null) }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN)
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    setCustomer(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN)
    if (token) refreshCustomer() // eslint-disable-line react-hooks/set-state-in-effect
  }, [refreshCustomer])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART)
      if (saved) setCart(JSON.parse(saved)) // eslint-disable-line react-hooks/set-state-in-effect
    } catch { /* ignore corrupt data */ }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG) as "en" | "ar" | null
      if (saved) setLang(saved)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)) } catch { /* ignore */ }
  }, [cart])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.LANG, lang) } catch { /* ignore */ }
    document.documentElement.classList.toggle("rtl", lang === "ar")
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  // Debounce search input
  const setSearch = useCallback((val: string) => {
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 250)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get("search")
    if (q) {
      setSearchInput(q) // eslint-disable-line react-hooks/set-state-in-effect
      setDebouncedSearch(q)
    }
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      if (existing) {
        return prev.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, { ...item }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product_id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.product_id !== productId)); return }
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = useMemo(() => cart.length, [cart])
  const cartIds = useMemo(() => new Set(cart.map(i => i.product_id)), [cart])

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category_id === selectedCategory)
    }
    if (debouncedSearch) {
      const fuse = new Fuse(result, {
        keys: [
          { name: "name_en", weight: 2 },
          { name: "name_ar", weight: 2 },
        ],
        threshold: 0.4,
        minMatchCharLength: 1,
      })
      result = fuse.search(debouncedSearch).map(r => r.item)
    }
    return result
  }, [products, debouncedSearch, selectedCategory])

  return (
    <StoreContext.Provider value={{
      products, categories, cart, lang, search: searchInput, selectedCategory, customer,
      setLang, setSearch, setSelectedCategory,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartIds, filteredProducts, logout, refreshCustomer,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
