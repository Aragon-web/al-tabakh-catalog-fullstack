"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from "react"
import type { Product, CartItem, Category } from "./types"
import { STORAGE_KEYS } from "./constants"

interface StoreState {
  products: Product[]
  categories: Category[]
  cart: CartItem[]
  lang: "en" | "ar"
  search: string
  selectedCategory: string
  setLang: (lang: "en" | "ar") => void
  setSearch: (s: string) => void
  setSelectedCategory: (id: string) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  cartIds: Set<string>
  filteredProducts: Product[]
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children, products, categories }: { children: ReactNode; products: Product[]; categories: Category[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [lang, setLang] = useState<"en" | "ar">("ar")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART)
      if (saved) setCart(JSON.parse(saved))
    } catch { /* ignore corrupt data */ }
    try {
      const savedLang = localStorage.getItem(STORAGE_KEYS.LANG) as "en" | "ar" | null
      if (savedLang) setLang(savedLang)
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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      if (existing) {
        return prev.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
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

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart])
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart])
  const cartIds = useMemo(() => new Set(cart.map(i => i.product_id)), [cart])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        const matches = p.name_en.toLowerCase().includes(q) || p.name_ar.includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [products, debouncedSearch, selectedCategory])

  return (
    <StoreContext.Provider value={{
      products, categories, cart, lang, search: searchInput, selectedCategory,
      setLang, setSearch, setSelectedCategory,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, cartIds, filteredProducts
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
