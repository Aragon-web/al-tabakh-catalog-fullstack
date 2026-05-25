"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search } from "lucide-react"
import { useFocusTrap } from "@/lib/useFocusTrap"
import { Spinner } from "@/components/Spinner"
import { useDelayedLoading } from "@/lib/useDelayedLoading"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface CustomerRow {
  id: number; name: string; email: string; phone: string | null; points: number; created_at: string
}

export function CustomersLoyaltySection({ token, showToast }: { token: string; showToast: (type: "success" | "error", text: string) => void }) {
  const { lang } = useStore(); const t = adminT[lang]
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [adjustFor, setAdjustFor] = useState<CustomerRow | null>(null)
  const [points, setPoints] = useState(0)
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const showLoading = useDelayedLoading(loading, 300)
  const adjustTrapRef = useFocusTrap(!!adjustFor)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/customers", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setCustomers(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/set-state-in-effect,react-hooks/exhaustive-deps

  const filtered = useMemo(() => customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ), [customers, search])

  async function adjustPoints(customerId: number, delta: number, reasonText: string) {
    if (!reasonText || delta === 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customer_id: customerId, points: delta, reason: reasonText }),
      })
      if (res.ok) { showToast("success", "Points adjusted"); setAdjustFor(null); setPoints(0); setReason(""); load() }
      else { const d = await res.json(); showToast("error", d.error || "Failed") }
    } catch { showToast("error", "Network error") }
    setSaving(false)
  }

  return (
    <div>
      <h2 className="text-base sm:text-lg font-bold mb-3">{t.loyaltyCustomers} ({customers.length})</h2>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input type="text" placeholder={t.searchCustomers} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none" aria-label={t.searchCustomers}
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
      </div>
      {showLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size={20} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>{t.noCustomers}</p>
      ) : (
        <div className="space-y-1.5 max-h-[65vh] overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{c.name}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{c.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{c.points} {t.pts}</span>
                <button onClick={() => { setAdjustFor(c); setPoints(0); setReason("") }} className="p-1 rounded" style={{ color: "var(--text-muted)" }} aria-label={t.adjustPoints}><Plus size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adjustFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => !saving && setAdjustFor(null)} onKeyDown={e => { if (e.key === "Escape" && !saving) setAdjustFor(null) }} role="dialog" aria-modal="true" tabIndex={-1}>
          <div ref={adjustTrapRef} className="rounded-2xl w-full max-w-sm p-5" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-1">{t.adjustPoints}</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>{adjustFor.name} &middot; {t.pts}: {adjustFor.points}</p>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setPoints(p => p - 10)} className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>-10</button>
              <input type="number" value={points} onChange={e => setPoints(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-center outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button onClick={() => setPoints(p => p + 10)} className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>+10</button>
            </div>
            <input placeholder={t.reason} value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-4" aria-label={t.reason} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <div className="flex gap-3">
              <button onClick={() => setAdjustFor(null)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>{t.cancel}</button>
              <button onClick={() => adjustPoints(adjustFor.id, points, reason)} disabled={!reason || points === 0 || saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: (!reason || points === 0 || saving) ? 0.6 : 1 }}>
                {saving ? <><Spinner size={14} /> {t.saving}</> : points > 0 ? t.addPoints : t.deductPoints}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}