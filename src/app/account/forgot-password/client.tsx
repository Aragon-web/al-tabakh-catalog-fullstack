"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) { setError("Email is required"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/customers/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) { setSent(true) }
      else { const d = await res.json(); setError(d.error || "Failed") }
    } catch { setError("Connection error") }
    finally { setLoading(false) }
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 pt-28 sm:pt-32">
        <div className="p-6 sm:p-8 rounded-2xl w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {sent ? (
            <div className="text-center">
              <Mail size={40} style={{ color: "var(--accent)" }} className="mx-auto mb-4" />
              <h1 className="text-lg font-bold mb-2">Check Your Email</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>If an account exists, we&apos;ve sent a reset link to {email}</p>
              <Link href="/account/login" className="inline-block mt-4 text-sm font-medium" style={{ color: "var(--accent)" }}>Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="text-xl font-bold mb-1">Forgot Password</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Enter your email to receive a reset link</p>
              {error && <p className="text-sm mb-3" style={{ color: "var(--accent)" }}>{error}</p>}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoFocus required
                className="w-full px-4 py-3 rounded-lg outline-none text-sm mb-4"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-medium text-sm disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#fff" }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/account/login" className="flex items-center justify-center gap-1.5 mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
