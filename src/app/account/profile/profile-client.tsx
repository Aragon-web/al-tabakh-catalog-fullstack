"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { useDelayedLoading } from "@/lib/useDelayedLoading"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { STORAGE_KEYS } from "@/lib/constants"
import { LogOut, Package, Award, ChevronDown, Pencil, Check, X } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import type { Order, LoyaltyTransaction } from "@/lib/types"

export function ProfileClient() {
  const { lang, customer, logout, refreshCustomer } = useStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [txns, setTxns] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const showLoading = useDelayedLoading(loading, 300)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN)
    if (!token) { router.push("/account/login"); return }
    refreshCustomer()
    Promise.all([
      fetch("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      fetch("/api/loyalty/my", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
    ]).then(([ords, t]) => {
      if (Array.isArray(ords)) setOrders(ords)
      if (Array.isArray(t)) setTxns(t)
    }).catch(() => {}).finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startEditing = () => {
    setEditName(customer?.name || "")
    setEditPhone(customer?.phone || "")
    setEditing(true)
    setSaveError("")
  }

  const saveProfile = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN)
    if (!token || !editName.trim()) return
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/customers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() || null }),
      })
      if (res.ok) {
        setEditing(false)
        refreshCustomer()
      } else {
        const d = await res.json()
        setSaveError(d.error || "Failed to save")
      }
    } catch { setSaveError("Network error") }
    setSaving(false)
  }

  const cancelEditing = () => {
    setEditing(false)
    setSaveError("")
  }

  const t = {
    en: { orders: "My Orders", loyalty: "Loyalty Points", points: "points", history: "History", profile: "Profile", logoutLabel: "Logout", noOrders: "No orders yet", empty: "No transactions yet", edit: "Edit", save: "Save", cancel: "Cancel", name: "Name", phone: "Phone", saving: "Saving..." },
    ar: { orders: "طلباتي", loyalty: "نقاط الولاء", points: "نقطة", history: "السجل", profile: "الملف الشخصي", logoutLabel: "تسجيل الخروج", noOrders: "لا توجد طلبات بعد", empty: "لا توجد معاملات بعد", edit: "تعديل", save: "حفظ", cancel: "إلغاء", name: "الاسم", phone: "الهاتف", saving: "جاري الحفظ..." },
  }[lang]

  if (showLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={24} /></div>

  return (
    <><Header />
    <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8">
      {customer && (
        <div className="p-4 sm:p-6 rounded-xl mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {editing ? (
            <div className="space-y-3">
              <input value={editName} onChange={e => setEditName(e.target.value)} placeholder={t.name}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.name} style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder={t.phone}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" aria-label={t.phone} style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              {saveError && <p className="text-xs" style={{ color: "var(--accent)" }}>{saveError}</p>}
              <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving || !editName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: saving ? 0.6 : 1 }}>
                  <Check size={14} /> {saving ? t.saving : t.save}
                </button>
                <button onClick={cancelEditing} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                  <X size={14} /> {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-lg font-bold">{customer.name}</h1>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{customer.email}</p>
                  {customer.phone && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{customer.phone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={startEditing} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }} title={t.edit} aria-label={t.edit}><Pencil size={15} /></button>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{customer.points}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t.points}</p>
                </div>
                <button onClick={() => { logout(); router.push("/") }} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }} title={t.logoutLabel} aria-label={t.logoutLabel}><LogOut size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      <h2 className="text-base font-bold mb-3 flex items-center gap-2"><Package size={16} /> {t.orders}</h2>
      {orders.length === 0 ? (
        <p className="text-sm py-8" style={{ color: "var(--text-muted)" }}>{t.noOrders}</p>
      ) : (
        <div className="space-y-2 mb-8">
          {orders.map(order => (
            <div key={order.id} className="rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="flex items-center justify-between w-full text-left px-4 py-3 min-h-[48px]">
                <div>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{order.id.slice(0, 8)}...</span>
                  <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: order.status === "delivered" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: order.status === "delivered" ? "#10B981" : "#F59E0B" }}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: expandedOrder === order.id ? "rotate(180deg)" : "" }} />
                </div>
              </button>
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs pt-2" style={{ color: "var(--text-secondary)" }}>
                      <span>{lang === "en" ? item.name_en : item.name_ar} x{item.quantity}</span>
                    </div>
                  ))}
                  <p className="text-[10px] pt-1" style={{ color: "var(--text-muted)" }}>{new Date(order.created_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-base font-bold mb-3 flex items-center gap-2"><Award size={16} /> {t.loyalty}</h2>
      {txns.length === 0 ? (
        <p className="text-sm py-8" style={{ color: "var(--text-muted)" }}>{t.empty}</p>
      ) : (
        <div className="space-y-1.5">
          {txns.map(txn => (
            <div key={txn.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div>
                <p className="text-xs font-medium">{txn.reason}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{new Date(txn.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-bold ${txn.type === "earn" ? "" : ""}`} style={{ color: txn.type === "earn" ? "#10B981" : "#EF4444" }}>
                {txn.type === "earn" ? "+" : "-"}{txn.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
    <Footer /></>
  )
}