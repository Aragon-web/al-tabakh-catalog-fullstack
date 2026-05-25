"use client"

import { AlertTriangle, X } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import { useFocusTrap } from "@/lib/useFocusTrap"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel, danger = true, onConfirm, onCancel, loading,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  const { lang } = useStore(); const t = adminT[lang]
  const cl = confirmLabel || t.deleteDefault
  const cal = cancelLabel || t.cancelDefault
  const trapRef = useFocusTrap(open)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel} onKeyDown={e => { if (e.key === "Escape") onCancel() }} role="dialog" aria-modal="true" tabIndex={-1}>
      <div ref={trapRef} className="rounded-2xl w-full max-w-sm p-6" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: danger ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)" }}>
            <AlertTriangle size={20} style={{ color: danger ? "#EF4444" : "#3B82F6" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{message}</p>
          </div>
          <button onClick={onCancel} className="ml-auto p-1 rounded" style={{ color: "var(--text-muted)" }} aria-label="Close dialog"><X size={16} /></button>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>{cal}</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ background: danger ? "#DC2626" : "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Spinner size={14} /> {cl}</> : cl}
          </button>
        </div>
      </div>
    </div>
  )
}
