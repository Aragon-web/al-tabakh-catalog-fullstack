import { useCallback } from "react"
import type { CartItem } from "./types"

export function useSaveOrder() {
  return useCallback((cart: CartItem[], total: number) => {
    const order = {
      id: "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      items: cart,
      total,
      customer_name: "",
      customer_phone: "",
      notes: "",
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Save to localStorage
    const stored = localStorage.getItem("altabakh_orders")
    const orders = stored ? JSON.parse(stored) : []
    orders.unshift(order)
    localStorage.setItem("altabakh_orders", JSON.stringify(orders.slice(0, 100)))

    return order
  }, [])
}
