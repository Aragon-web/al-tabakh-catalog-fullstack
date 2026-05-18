"use client"

import { useEffect, useState } from "react"
import { StoreProvider } from "@/lib/store"
import { ClientPage } from "./client-page"
import type { Product, Category } from "@/lib/types"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p)
      setCategories(c)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="animate-spin w-8 h-8 rounded-full" style={{ border: "2px solid var(--border)", borderTopColor: "var(--accent)" }} />
      </div>
    )
  }

  return (
    <StoreProvider products={products} categories={categories}>
      <ClientPage />
    </StoreProvider>
  )
}
