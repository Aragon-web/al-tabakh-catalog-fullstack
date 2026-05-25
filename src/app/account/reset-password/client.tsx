"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { STORAGE_KEYS } from "@/lib/constants"

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!token) { setError("Invalid reset link"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/customers/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, data.auth_token)
        router.push("/account/profile")
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch { setError("Connection error") }
    finally { setLoading(false) }
  }

  if (!token) {
    return (
      <main className="flex-1 flex items-center justify-center p-4 pt-28 sm:pt-32">
        <p style={{ color: "var(--text-muted)" }}>Invalid reset link</p>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4 pt-28 sm:pt-32">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="text-xl font-bold mb-6">Set New Password</h1>
        {error && <p className="text-sm mb-3" style={{ color: "var(--accent)" }}>{error}</p>}
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" autoFocus required minLength={6}
          className="w-full px-4 py-3 rounded-lg outline-none text-sm mb-3"
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" required minLength={6}
          className="w-full px-4 py-3 rounded-lg outline-none text-sm mb-4"
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-sm disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </main>
  )
}

export function ResetPasswordClient() {
  return (
    <>
      <Header />
      <Suspense fallback={null}><ResetForm /></Suspense>
      <Footer />
    </>
  )
}
