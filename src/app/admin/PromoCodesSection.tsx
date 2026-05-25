"use client"

import { useEffect, useState, useCallback } from "react"
import { Gift, Plus, Search, CheckCircle, XCircle, Download, Trophy, Users, Sparkles, RefreshCw, Copy } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import { useDelayedLoading } from "@/lib/useDelayedLoading"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"
import { useRouter } from "next/navigation"

interface PromoCode {
  id: number; code: string; is_used: boolean; used_by_customer_id: number | null; used_at: string | null; created_at: string
}

interface EligibleEntrant {
  id: number; name: string; phone: string; email: string; points: number
}

export function PromoCodesSection({ token, showToast }: { token: string; showToast: (type: "success" | "error", text: string) => void }) {
  const { lang } = useStore(); const t = adminT[lang]
  const router = useRouter()
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [stats, setStats] = useState({ total: 0, used: 0 })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [entrants, setEntrants] = useState<EligibleEntrant[]>([])
  const [showEntrants, setShowEntrants] = useState(false)
  const [drawResult, setDrawResult] = useState<EligibleEntrant | null>(null)
  const [showDraw, setShowDraw] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [showDetails, setShowDetails] = useState<number | null>(null)
  const showLoading = useDelayedLoading(loading, 300)

  const loadCodes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/promo", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) return
      const data = await res.json()
      setCodes(data.codes || [])
      setStats(data.stats || { total: 0, used: 0 })
    } catch {} finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadCodes() }, [loadCodes])

  async function generateCodes() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count: 15000 }),
      })
      const data = await res.json()
      if (res.ok) { showToast("success", `${data.generated} codes generated`); loadCodes() }
      else showToast("error", data.error || "Failed")
    } catch { showToast("error", "Network error") }
    setGenerating(false)
  }

  async function loadEntrants() {
    setShowEntrants(true)
    try {
      const res = await fetch("/api/admin/promo/eligible", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const data = await res.json(); setEntrants(data.entrants || []) }
    } catch {}
  }

  async function drawWinner() {
    setDrawing(true)
    try {
      const res = await fetch("/api/admin/promo/draw", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { const data = await res.json(); setDrawResult(data.winner); setShowDraw(true) }
      else showToast("error", "Failed to draw")
    } catch { showToast("error", "Network error") }
    setDrawing(false)
  }

  const filtered = codes.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Total Codes" : "إجمالي الرموز"}</p>
          <p className="text-lg font-bold">{stats.total.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Used" : "مستخدم"}</p>
          <p className="text-lg font-bold" style={{ color: "#10b981" }}>{stats.used.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Remaining" : "متبقي"}</p>
          <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{(stats.total - stats.used).toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Redeem Rate" : "نسبة الاستخدام"}</p>
          <p className="text-lg font-bold">{stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0}%</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={generateCodes} disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}>
          {generating ? <Spinner size={12} /> : <Sparkles size={12} />}
          {generating ? (lang === "en" ? "Generating..." : "جاري التوليد...") : (lang === "en" ? "Generate 15,000 Codes" : "توليد ١٥٠٠٠ رمز")}
        </button>
        <button onClick={loadEntrants}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
          <Users size={12} /> {lang === "en" ? "Eligible Entrants" : "المتقدمون المؤهلون"}
        </button>
        <button onClick={drawWinner} disabled={drawing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
          {drawing ? <Spinner size={12} /> : <Trophy size={12} />}
          {lang === "en" ? "Draw Winner" : "سحب الفائز"}
        </button>
      </div>

      {/* Entrants List */}
      {showEntrants && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold">{lang === "en" ? `Eligible Entrants (${entrants.length})` : `المتقدمون المؤهلون (${entrants.length})`}</h3>
            <button onClick={() => setShowEntrants(false)} style={{ color: "var(--text-muted)" }} className="text-xs">X</button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {entrants.map(e => (
              <div key={e.id} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-primary)" }}>{e.name}</span>
                <span style={{ color: "var(--text-muted)" }}>{e.phone}</span>
              </div>
            ))}
            {entrants.length === 0 && <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "No entrants yet" : "لا يوجد متقدمون بعد"}</p>}
          </div>
        </div>
      )}

      {/* Winner Display */}
      {showDraw && drawResult && (
        <div className="mb-4 p-6 rounded-xl text-center animate-fade-in" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "2px solid #fbbf24" }}>
          <Trophy size={40} style={{ color: "#fbbf24" }} className="mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white mb-1">{lang === "en" ? "WINNER!" : "الفائز!"}</h3>
          <p className="text-xl font-bold" style={{ color: "#fbbf24" }}>{drawResult.name}</p>
          <p className="text-sm text-white/60">{drawResult.phone} · {drawResult.email}</p>
          <button onClick={() => { setShowDraw(false); setDrawResult(null) }}
            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
            {lang === "en" ? "Close" : "إغلاق"}
          </button>
        </div>
      )}

      {/* Search + Table */}
      <div className="mb-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={lang === "en" ? "Search codes..." : "بحث عن رموز..."}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
      </div>

      {showLoading ? (
        <div className="flex items-center justify-center py-12"><Spinner size={20} /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Code" : "الرمز"}</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Status" : "الحالة"}</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Customer ID" : "معرف العميل"}</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Used At" : "تاريخ الاستخدام"}</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Created" : "تاريخ الإنشاء"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2 font-mono font-bold">{c.code}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: c.is_used ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: c.is_used ? "#10b981" : "#ef4444" }}>
                      {c.is_used ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {c.is_used ? (lang === "en" ? "Used" : "مستخدم") : (lang === "en" ? "Active" : "نشط")}
                    </span>
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--text-muted)" }}>{c.used_by_customer_id || "-"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--text-muted)" }}>{c.used_at ? new Date(c.used_at).toLocaleDateString() : "-"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--text-muted)" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "No codes found" : "لا توجد رموز"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
