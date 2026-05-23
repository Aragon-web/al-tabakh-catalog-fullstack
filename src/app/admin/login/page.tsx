"use client"
import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Eye, EyeOff } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/admin"

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), []) // eslint-disable-line react-hooks/set-state-in-effect

  if (!mounted) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!password.trim()) { setError("Password is required"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem("admin_token", data.token)
        router.push(redirect)
      } else {
        setError(data.error || "Invalid password")
      }
    } catch {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <form onSubmit={handleLogin} className="p-6 sm:p-8 rounded-2xl w-full max-w-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} style={{ color: "var(--accent)" }} />
          <h1 className="text-xl font-bold">Admin Login</h1>
        </div>
        {error && <p className="text-sm mb-3" style={{ color: "var(--accent)" }} role="alert">{error}</p>}
        <div className="relative mb-4">
          <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" autoFocus aria-label="Admin password"
            className="w-full px-4 py-3 rounded-lg outline-none text-sm pr-11"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center" style={{ color: "var(--text-muted)" }} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-sm disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}
