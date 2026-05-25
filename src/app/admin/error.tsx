"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.15)" }}>
          <AlertTriangle size={28} style={{ color: "#EF4444" }} />
        </div>
        <h1 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Admin Error</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Something went wrong in the admin panel. Try refreshing or go back.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: "var(--accent)", color: "#fff" }}>
            <RefreshCw size={13} /> Try Again
          </button>
          <Link href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
            <ArrowLeft size={13} /> Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
