"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PageTransition } from "@/components/PageTransition"
import { useStore } from "@/lib/store"
import { Gift, Ticket, CheckCircle, XCircle, Trophy, ArrowRight, LogIn, Award, Coins } from "lucide-react"
import Link from "next/link"

declare global { interface Window { altabakh_customer_token?: string } }

export function IphoneClient() {
  const { lang, customer } = useStore()
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [msg, setMsg] = useState("")
  const [userPoints, setUserPoints] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("altabakh_customer_token")
    if (token) {
      setIsLoggedIn(true)
      fetch("/api/customers/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setUserPoints(d.points || 0)).catch(() => {})
    }
  }, [customer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!/^[A-Z0-9]{8}$/.test(clean)) { setStatus("error"); setMsg(lang === "en" ? "Enter an 8-character code" : "أدخل رمزًا من ٨ أحرف"); return }
    setStatus("loading")
    const token = localStorage.getItem("altabakh_customer_token")
    if (!token) { setStatus("error"); setMsg(lang === "en" ? "Please login first" : "يرجى تسجيل الدخول أولاً"); return }
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: clean }),
      })
      const data = await res.json()
      if (res.ok) { setStatus("success"); setMsg(lang === "en" ? `+30 points earned! Total: ${data.points}` : `+٣٠ نقطة! الإجمالي: ${data.points}`); setUserPoints(data.points) }
      else { setStatus("error"); setMsg(data.error || (lang === "en" ? "Invalid code" : "رمز غير صالح")) }
    } catch { setStatus("error"); setMsg("Network error") }
  }

  return (
    <PageTransition>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--accent) 0%, transparent 50%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: "rgba(255,255,255,0.1)", color: "#fbbf24" }}>
              <Trophy size={12} /> {lang === "en" ? "GRAND PRIZE" : "الجائزة الكبرى"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
              {lang === "en" ? "Win an iPhone 17 Pro Max" : "اربح آيفون 17 برو ماكس"}
            </h1>
            <p className="text-lg text-white/70 mb-2">
              {lang === "en" ? "Value: 2,440,000 IQD" : "القيمة: ٢٬٤٤٠٬٠٠٠ دينار"}
            </p>
            <p className="text-sm text-white/50 mb-6">
              {lang === "en" ? "Enter your unique code from any Al-Tabakh product box" : "أدخل رمزك الفريد من أي منتج من منتجات مالك الطباخ"}
            </p>

            {!isLoggedIn ? (
              <Link href="/account/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: "var(--accent)", color: "#fff" }}>
                <LogIn size={16} /> {lang === "en" ? "Login to Enter" : "سجل الدخول للمشاركة"}
              </Link>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 8))} placeholder="TABAKH7X" maxLength={8}
                    className="flex-1 px-4 py-3.5 rounded-xl text-sm font-mono font-bold tracking-widest text-center uppercase outline-none"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", letterSpacing: "0.15em" }} />
                  <button type="submit" disabled={status === "loading"}
                    className="px-6 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    {status === "loading" ? "..." : <ArrowRight size={18} />}
                  </button>
                </div>
              </form>
            )}

            {status === "success" && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                <CheckCircle size={16} /> {msg}
              </div>
            )}
            {status === "error" && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                <XCircle size={16} /> {msg}
              </div>
            )}
          </div>
        </div>

        {/* Points + How it Works */}
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
          {isLoggedIn && (
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(var(--accent-rgb, 209,29,29), 0.15)" }}>
                <Coins size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Your Points" : "نقاطك"}</p>
                <p className="text-xl font-bold">{userPoints}</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold mb-4">{lang === "en" ? "How to Enter" : "كيفية المشاركة"}</h2>
            <div className="space-y-3">
              {[
                { icon: Ticket, en: "Find your unique code inside any Al-Tabakh product box", ar: "ابحث عن الرمز الفريد داخل أي منتج من منتجات مالك الطباخ" },
                { icon: LogIn, en: "Register or login to your Al-Tabakh account", ar: "سجل أو ادخل إلى حسابك في مالك الطباخ" },
                { icon: Gift, en: "Enter the code above and earn 30 points instantly!", ar: "أدخل الرمز أعلاه واحصل على ٣٠ نقطة فورًا!" },
                { icon: Trophy, en: "Each code is one entry to win the iPhone 17 Pro Max", ar: "كل رمز هو فرصة للفوز بآيفون 17 برو ماكس" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                    <item.icon size={15} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{lang === "en" ? item.en : item.ar}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-bold mb-2">{lang === "en" ? "Earn More Points" : "اكسب المزيد من النقاط"}</h3>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>{lang === "en" ? "• Write a product review: +10 points" : "• اكتب مراجعة لمنتج: +١٠ نقاط"}</p>
              <p>{lang === "en" ? "• Review with a photo: +35 points" : "• مراجعة مع صورة: +٣٥ نقطة"}</p>
              <p>{lang === "en" ? "• Comment on a recipe: +5 points daily" : "• التعليق على وصفة: +٥ نقاط يوميًا"}</p>
              <p>{lang === "en" ? "• Register an account: +30 points" : "• تسجيل حساب: +٣٠ نقطة"}</p>
            </div>
          </div>

          <div className="text-center pt-4 pb-8">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {lang === "en" ? "100 points = 1,500 IQD value. Redeemable at Al-Tabakh stores." : "١٠٠ نقطة = ١٬٥٠٠ دينار. قابلة للاستبدال في فروع مالك الطباخ."}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
