"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import Link from "next/link"
import { STORAGE_KEYS } from "@/lib/constants"

export function RegisterClient() {
  const router = useRouter()
  const { refreshCustomer } = useStore()
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")
    if (!form.name || !form.email || !form.password) { setError("Name, email, and password required"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/customers/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.auth_token) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, data.auth_token)
        refreshCustomer()
        router.push("/account/profile")
      } else setError(data.error || "Registration failed")
    } catch { setError("Network error") }
    setLoading(false)
  }

  return (
    <><Header />
    <main className="flex-1 flex items-center justify-center p-4 pt-28 sm:pt-32">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-6">
          <UserPlus size={24} style={{ color: "var(--accent)" }} />
          <h1 className="text-xl font-bold">Register</h1>
        </div>
        {error && <p className="text-sm mb-3" style={{ color: "var(--accent)" }}>{error}</p>}
        <label htmlFor="reg-name" className="sr-only">Full Name *</label>
        <input id="reg-name" placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus
          className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none mb-3" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        <label htmlFor="reg-email" className="sr-only">Email *</label>
        <input id="reg-email" type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none mb-3" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        <label htmlFor="reg-phone" className="sr-only">Phone</label>
        <input id="reg-phone" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none mb-3" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        <div className="relative mb-4">
          <label htmlFor="reg-password" className="sr-only">Password *</label>
          <input id="reg-password" type={showPw ? "text" : "password"} placeholder="Password *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 min-touch rounded-lg outline-none text-sm pr-11" style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 px-3 flex items-center min-touch" style={{ color: "var(--text-muted)" }} aria-label={showPw ? "Hide password" : "Show password"}>
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 min-touch" style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}>
          {loading && <Spinner size={16} />} Register
        </button>
        <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
          Already have an account? <Link href="/account/login" className="font-medium" style={{ color: "var(--accent)" }}>Login</Link>
        </p>
      </form>
    </main>
    <Footer /></>
  )
}