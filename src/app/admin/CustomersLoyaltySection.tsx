"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { useFocusTrap } from "@/lib/useFocusTrap"

interface CustomerRow {
  id: number; name: string; email: string; phone: string | null; points: number; created_at: string
}

export function CustomersLoyaltySection({ token, showToast }: { token: string; showToast: (type: "success" | "error", text: string) => void }) {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [adjustFor, setAdjustFor] = useState<CustomerRow | null>(null)
  const [points, setPoints] = useState(0)
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
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

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

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
      <h2 className="text-base sm:text-lg font-bold mb-3">Loyalty & Customers ({customers.length})</h2>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none" aria-label="Search customers"
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>No customers found</p>
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
                <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{c.points} pts</span>
                <button onClick={() => { setAdjustFor(c); setPoints(0); setReason("") }} className="p-1 rounded" style={{ color: "var(--text-muted)" }} aria-label="Adjust points"><Plus size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adjustFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => !saving && setAdjustFor(null)} onKeyDown={e => { if (e.key === "Escape" && !saving) setAdjustFor(null) }} role="dialog" aria-modal="true" tabIndex={-1}>
          <div ref={adjustTrapRef} className="rounded-2xl w-full max-w-sm p-5" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-1">Adjust Points</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>{adjustFor.name} &middot; Current: {adjustFor.points}</p>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setPoints(p => p - 10)} className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>-10</button>
              <input type="number" value={points} onChange={e => setPoints(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-center outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button onClick={() => setPoints(p => p + 10)} className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>+10</button>
            </div>
            <input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <div className="flex gap-3">
              <button onClick={() => setAdjustFor(null)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={() => adjustPoints(adjustFor.id, points, reason)} disabled={!reason || points === 0 || saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: (!reason || points === 0 || saving) ? 0.6 : 1 }}>
                {saving ? "Saving..." : points > 0 ? "Add Points" : "Deduct Points"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}