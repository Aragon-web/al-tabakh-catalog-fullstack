import { useCallback } from "react"
import type { CartItem } from "./types"
import { STORAGE_KEYS } from "./constants"

export function useSaveOrder() {
  return useCallback((cart: CartItem[]) => {
    const id = "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    const order = {
      id,
      items: cart,
      customer_name: "",
      customer_phone: "",
      notes: "",
      status: "pending" as const,
      created_at: new Date().toISOString(),
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
      const orders = stored ? JSON.parse(stored) : []
      orders.unshift(order)
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders.slice(0, 100)))
    } catch (e) {
      console.error("Failed to save order to localStorage:", e)
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN)
    if (token) headers["Authorization"] = `Bearer ${token}`
    const opts: RequestInit = {
      method: "POST",
      headers,
      body: JSON.stringify({ items: cart }),
    }

    fetch("/api/orders", opts).catch(e => console.error("Failed to save order to server:", e))

    return { order, id }
  }, [])
}