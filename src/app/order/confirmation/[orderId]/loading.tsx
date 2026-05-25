"use client"

import { Spinner } from "@/components/Spinner"

export default function OrderConfirmationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center">
        <Spinner size={28} className="mb-3" />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading order details...</p>
      </div>
    </div>
  )
}
