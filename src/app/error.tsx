"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
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
        <h1 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Something went wrong</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>An unexpected error occurred. Please try again.</p>
        <button onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    </div>
  )
}
