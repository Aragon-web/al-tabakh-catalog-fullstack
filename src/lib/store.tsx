"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Product, CartItem, Category } from "./types"

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
  filteredProducts: Product[]
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children, products, categories }: { children: ReactNode; products: Product[]; categories: Category[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [lang, setLang] = useState<"en" | "ar">("ar")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const saved = localStorage.getItem("altabakh_cart")
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch { /* ignore */ }
    }
    const savedLang = localStorage.getItem("altabakh_lang") as "en" | "ar" | null
    if (savedLang) setLang(savedLang)
  }, [])

  useEffect(() => {
    localStorage.setItem("altabakh_cart", JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem("altabakh_lang", lang)
    document.documentElement.classList.toggle("rtl", lang === "ar")
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

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

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false
    if (search) {
      const q = search.toLowerCase()
      const matches = p.name_en.toLowerCase().includes(q) || p.name_ar.includes(q)
      if (!matches) return false
    }
    return true
  })

  return (
    <StoreContext.Provider value={{
      products, categories, cart, lang, search, selectedCategory,
      setLang, setSearch, setSelectedCategory,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, filteredProducts
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
