"use client"

import { useStore } from "@/lib/store"
import { Gift, Star, ShoppingBag, Award, CheckCircle } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Link from "next/link"

export function LoyaltyClient() {
  const { lang } = useStore()
  const t = {
    en: {
      title: "Loyalty Program",
      subtitle: "Earn points with every purchase and unlock exclusive rewards",
      how: "How It Works",
      rules: [
        "Earn points when you place an order while logged into your account",
        "Points are manually awarded by our team for each verified purchase",
        "Accumulate points to unlock exclusive discounts and offers",
        "Points never expire as long as your account is active",
        "Contact us via WhatsApp to redeem your points",
      ],
      steps: [
        { icon: ShoppingBag, title: "Place an Order", desc: "Log in to your account and place an order through our catalog or WhatsApp." },
        { icon: Gift, title: "Earn Points", desc: "Our team awards points to your account after each completed order." },
        { icon: Star, title: "Track Your Points", desc: "View your points balance and transaction history in your account dashboard." },
        { icon: Award, title: "Redeem Rewards", desc: "Contact us to use your points for discounts on future purchases." },
      ],
      login: "Login to Your Account",
      register: "Create an Account",
      start: "Create an account to start earning loyalty points on every order!",
    },
    ar: {
      title: "برنامج الولاء",
      subtitle: "اجمع النقاط مع كل عملية شراء واحصل على مكافآت حصرية",
      how: "كيف يعمل البرنامج",
      rules: [
        "اكسب النقاط عندما تقدم طلباً وأنت مسجل الدخول إلى حسابك",
        "يتم منح النقاط يدوياً من قبل فريقنا لكل عملية شراء مؤكدة",
        "اجمع النقاط لفتح خصومات وعروض حصرية",
        "النقاط لا تنتهي صلاحيتها طالما أن حسابك نشط",
        "اتصل بنا عبر واتساب لاستبدال نقاطك",
      ],
      steps: [
        { icon: ShoppingBag, title: "قدّم طلباً", desc: "سجل الدخول إلى حسابك وقدم طلباً من خلال كتالوجنا أو واتساب." },
        { icon: Gift, title: "اجمع النقاط", desc: "فريقنا يمنح النقاط لحسابك بعد كل طلب مكتمل." },
        { icon: Star, title: "تتبع نقاطك", desc: "شاهد رصيد نقاطك وسجل المعاملات في لوحة تحكم حسابك." },
        { icon: Award, title: "استبدل المكافآت", desc: "اتصل بنا لاستخدام نقاطك للحصول على خصومات على المشتريات المستقبلية." },
      ],
      login: "سجل الدخول إلى حسابك",
      register: "إنشاء حساب",
      start: "أنشئ حساباً لبدء جمع نقاط الولاء على كل طلب!",
    },
  }[lang]

  return (
    <> <Header /> <main style={{ background: "var(--bg)" }}>
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-10" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-2)" }}>
            <Award size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="heading text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {t.steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="p-5 sm:p-6 rounded-xl transition-all hover:scale-[1.02]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                  <Icon size={22} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--accent)", color: "#fff" }}>
                    {lang === "en" ? `Step ${i + 1}` : `الخطوة ${i + 1}`}
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1">{step.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </div>
            )
          })}
        </div>

        <h2 className="heading text-xl font-bold text-center mb-6">{t.how}</h2>
        <div className="space-y-3 mb-10 max-w-2xl mx-auto">
          {t.rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 p-3 sm:p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{rule}</p>
            </div>
          ))}
        </div>

        <div className="p-6 sm:p-8 rounded-2xl text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{t.start}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/account/register" className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
              {t.register}
            </Link>
            <Link href="/account/login" className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
              {t.login}
            </Link>
          </div>
        </div>
      </div>
    </main> <Footer /> </>
  )
}

