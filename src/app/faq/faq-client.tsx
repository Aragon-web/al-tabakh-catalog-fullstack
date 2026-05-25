"use client"

import { useStore } from "@/lib/store"
import { ChevronDown, Home } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useSiteConfig } from "@/lib/theme-provider"
import Link from "next/link"

const faqData = {
  en: [
    {
      q: "What delivery areas do you serve?",
      a: "We deliver to all governorates of Iraq including Erbil, Baghdad, Sulaymaniyah, Duhok, and surrounding areas. Delivery times vary by location — typically 1-2 business days for nearby cities and up to 3 business days for farther regions.",
    },
    {
      q: "What is the minimum order amount?",
      a: "There is no minimum order amount for delivery. Whether you need a single spice packet or a bulk wholesale order, we deliver to your doorstep.",
    },
    {
      q: "Do you offer wholesale pricing for businesses?",
      a: "Yes, we offer special wholesale pricing for restaurants, hotels, bakeries, supermarkets, and other businesses. Contact us via WhatsApp or phone to discuss bulk orders and receive a customized quote.",
    },
    {
      q: "How can I contact customer support?",
      a: "You can reach us via WhatsApp at +964 773 331 0100, or use the contact form on our website. Our business hours are Saturday through Thursday, 8:00 AM to 8:00 PM.",
    },
  ],
  ar: [
    {
      q: "ما هي مناطق التوصيل التي تغطونها؟",
      a: "نقوم بالتوصيل إلى جميع محافظات العراق بما في ذلك أربيل، بغداد، السليمانية، دهوك، والمناطق المجاورة. تختلف أوقات التوصيل حسب الموقع — عادة ١-٢ يوم عمل للمدن القريبة وحتى ٣ أيام عمل للمناطق البعيدة.",
    },
    {
      q: "ما هو الحد الأدنى للطلب؟",
      a: "لا يوجد حد أدنى للطلب للتوصيل. سواء كنت بحاجة إلى كيس بهارات واحد أو طلب بالجملة، نوصل إلى باب منزلك.",
    },
    {
      q: "هل تقدمون أسعار الجملة للشركات؟",
      a: "نعم، نقدم أسعار جملة خاصة للمطاعم والفنادق والمخابز والسوبرماركت وغيرها من الشركات. اتصل بنا عبر واتساب أو الهاتف لمناقشة الطلبات بالجملة والحصول على عرض سعر مخصص.",
    },
    {
      q: "كيف يمكنني الاتصال بخدمة العملاء؟",
      a: "يمكنك التواصل معنا عبر واتساب على +964 773 331 0100، أو من خلال نموذج الاتصال على موقعنا. ساعات العمل من السبت إلى الخميس، من ٨:٠٠ صباحاً إلى ٨:٠٠ مساءً.",
    },
  ],
}

export function FaqClient() {
  const { lang } = useStore()
  const { whatsapp } = useSiteConfig()
  const t = {
    en: { title: "Frequently Asked Questions", subtitle: "Everything you need to know about ordering from Al-Tabakh" },
    ar: { title: "الأسئلة الشائعة", subtitle: "كل ما تحتاج معرفته عن الطلب من الطباخ" },
  }[lang]

  return (
    <> <Header /> <main style={{ background: "var(--bg)" }}>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-3">
          {faqData[lang].map((item, i) => (
            <details
              key={i}
              className="group rounded-xl overflow-hidden transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 cursor-pointer min-h-[52px] text-sm sm:text-base font-medium list-none select-none"
                style={{ color: "var(--text-primary)" }}>
                <span className="flex-1">{item.q}</span>
                <ChevronDown size={16} className="flex-shrink-0 transition-transform duration-200 group-open:rotate-180" style={{ color: "var(--text-muted)" }} />
              </summary>
              <div className="px-4 sm:px-5 pb-5 pt-1">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 p-5 sm:p-6 rounded-xl text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            {lang === "en" ? "Still have questions?" : "لا تزال لديك أسئلة؟"}
          </p>
          <Link
            href={`https://wa.me/${(whatsapp.numbers[0]?.phone || whatsapp.orderTarget).replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--wa)", color: "#fff" }}
          >
            {lang === "en" ? "Contact us on WhatsApp" : "اتصل بنا عبر واتساب"}
          </Link>
        </div>
      </div>
    </main> <Footer /> </>
  )
}

