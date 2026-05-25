"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PageTransition } from "@/components/PageTransition"
import { useStore } from "@/lib/store"
import { Gift, Camera, CheckCircle, Send, Star, Users } from "lucide-react"

export function CreatorsClient() {
  const { lang } = useStore()
  const [form, setForm] = useState({ name: "", phone: "", facebook_profile: "", statement: "" })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setError(lang === "en" ? "Name and phone required" : "الاسم والهاتف مطلوبان"); return }
    setSubmitting(true); setError("")
    try {
      const res = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) setSubmitted(true)
      else setError(data.error || (lang === "en" ? "Failed to submit" : "فشل التقديم"))
    } catch { setError("Network error") }
    setSubmitting(false)
  }

  return (
    <PageTransition>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: "rgba(var(--accent-rgb, 209,29,29), 0.1)", color: "var(--accent)" }}>
              <Star size={12} /> {lang === "en" ? "CREATOR PROGRAM" : "برنامج المبدعين"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{lang === "en" ? "Become an Al-Tabakh Creator" : "كن مبدعًا مع مالك الطباخ"}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {lang === "en" ? "Get free products, create cooking content, and grow with us." : "احصل على منتجات مجانية، أنشئ محتوى طبخ، وانمو معنا."}
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.15)" }}>
                <CheckCircle size={32} style={{ color: "#10b981" }} />
              </div>
              <h2 className="text-lg font-bold mb-2">{lang === "en" ? "Application Submitted!" : "تم تقديم الطلب!"}</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{lang === "en" ? "We'll review your application and get back to you soon." : "سنراجع طلبك ونتواصل معك قريبًا."}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {error && <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Full Name" : "الاسم الكامل"}</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Phone Number" : "رقم الهاتف"}</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required dir="ltr"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Facebook / Instagram Profile (optional)" : "رابط فيسبوك أو إنستغرام (اختياري)"}</label>
                <input value={form.facebook_profile} onChange={e => setForm(f => ({ ...f, facebook_profile: e.target.value }))} dir="ltr"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Why would you be a great creator?" : "لماذا ستكون مبدعًا رائعًا؟"}</label>
                <textarea value={form.statement} onChange={e => setForm(f => ({ ...f, statement: e.target.value }))} rows={4} maxLength={500}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", resize: "vertical" }} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "var(--accent)", color: "#fff" }}>
                {submitting ? "..." : <><Send size={15} /> {lang === "en" ? "Submit Application" : "تقديم الطلب"}</>}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { icon: Gift, en: "Free Products", ar: "منتجات مجانية" },
                { icon: Camera, en: "Content Support", ar: "دعم المحتوى" },
                { icon: Users, en: "Community", ar: "مجتمع" },
                { icon: Star, en: "Exposure", ar: "انتشار" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <item.icon size={20} style={{ color: "var(--accent)" }} className="mx-auto mb-1" />
                  <p className="text-xs font-semibold">{lang === "en" ? item.en : item.ar}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
