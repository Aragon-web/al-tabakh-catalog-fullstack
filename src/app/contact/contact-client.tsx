"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Send, Check, Phone, Mail, MapPin, Home } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import { useSiteConfig } from "@/lib/theme-provider"
import Link from "next/link"

export function ContactClient() {
  const { lang } = useStore()
  const { whatsapp } = useSiteConfig()
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const t = {
    en: {
      title: "Contact Us", subtitle: "We'd love to hear from you. Get in touch with our team.",
      name: "Full Name", email: "Email Address", subject: "Subject", message: "Your Message",
      send: "Send Message", sending: "Sending...", success: "Message sent successfully! We'll get back to you soon.",
      info: "Contact Information", phone: "+964 773 331 0100", hours: "Sat–Thu, 8:00 AM – 8:00 PM",
      address: "Erbil, Kurdistan Region, Iraq",
    },
    ar: {
      title: "اتصل بنا", subtitle: "يسعدنا التواصل معك. تواصل مع فريقنا.",
      name: "الاسم الكامل", email: "البريد الإلكتروني", subject: "الموضوع", message: "رسالتك",
      send: "إرسال الرسالة", sending: "جارٍ الإرسال...", success: "تم إرسال الرسالة بنجاح! سنعود إليك قريباً.",
      info: "معلومات الاتصال", phone: "+٩٦٤ ٧٧٣ ٣٣١ ٠١٠٠", hours: "السبت – الخميس، ٨:٠٠ صباحاً – ٨:٠٠ مساءً",
      address: "أربيل، إقليم كردستان، العراق",
    },
  }[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")
    if (!form.name || !form.email || !form.subject || !form.message) { setError("All fields are required"); return }
    setSending(true)
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (res.ok) { setDone(true); setForm({ name: "", email: "", subject: "", message: "" }) }
      else { const d = await res.json(); setError(d.error || "Failed to send") }
    } catch { setError("Network error") }
    setSending(false)
  }

  return (
    <>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        <div className="pt-20 sm:pt-24 pb-6" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
              <span>/</span>
              <span style={{ color: "var(--text-secondary)" }}>{t.title}</span>
            </nav>
            <h1 className="heading text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            <div className="md:col-span-2">
              {done ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(37,211,102,0.15)" }}>
                    <Check size={24} style={{ color: "var(--wa)" }} />
                  </div>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{t.success}</p>
                  <button onClick={() => setDone(false)} className="px-4 py-2 rounded-lg text-sm min-touch flex items-center" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                    {lang === "en" ? "Send another" : "إرسال رسالة أخرى"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label htmlFor="contact-name" className="sr-only">{t.name}</label>
                    <input id="contact-name" placeholder={t.name} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none" style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                    <label htmlFor="contact-email" className="sr-only">{t.email}</label>
                    <input id="contact-email" placeholder={t.email} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none" style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                  </div>
                  <label htmlFor="contact-subject" className="sr-only">{t.subject}</label>
                  <input id="contact-subject" placeholder={t.subject} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none" style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                  <label htmlFor="contact-message" className="sr-only">{t.message}</label>
                  <textarea id="contact-message" placeholder={t.message} rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 min-touch rounded-lg text-sm outline-none resize-none" style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                  {error && <p className="text-xs" style={{ color: "var(--accent)" }}>{error}</p>}
                  <button type="submit" disabled={sending}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium w-full transition-opacity min-touch"
                    style={{ background: "var(--accent)", color: "#fff", opacity: sending ? 0.7 : 1 }}>
                    {sending ? <Spinner size={16} /> : <Send size={16} />}
                    {sending ? t.sending : t.send}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>{t.info}</h3>
              {whatsapp.numbers.map((n, idx) => (
                <a key={idx} href={`https://wa.me/${n.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors min-touch" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  <Phone size={16} style={{ color: "var(--wa)" }} />
                  <span>{n.label ? `${n.label}: ` : ""}{n.phone}</span>
                </a>
              ))}
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <Mail size={16} style={{ color: "var(--accent)" }} /> {lang === "en" ? "info@altabakh.com" : "info@altabakh.com"}
              </div>
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <MapPin size={16} style={{ color: "var(--accent)" }} className="mt-0.5 flex-shrink-0" />
                <span>{t.address}</span>
              </div>
              <p className="text-xs pt-2" style={{ color: "var(--text-muted)" }}>{t.hours}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}