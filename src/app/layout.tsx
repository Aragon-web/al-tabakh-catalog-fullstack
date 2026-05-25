import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Tajawal, Noto_Sans_Arabic } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { BackToTop } from "@/components/BackToTop"
import { PageTransition } from "@/components/PageTransition"
import { Analytics } from "@vercel/analytics/react"
import { getAdminClient } from "@/lib/supabase"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const tajawal = Tajawal({ variable: "--font-tajawal", subsets: ["arabic"], weight: ["400", "500", "700", "800"] })
const notoSansArabic = Noto_Sans_Arabic({ variable: "--font-noto-sans-arabic", subsets: ["arabic"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://al-tabakh-v3.vercel.app"),
  title: {
    default: "Al-Tabakh Premium Catalog",
    template: "%s | Al-Tabakh",
  },
  description: "Premium food products since 1999 - Malek Al-Tabakh Company for food supplies and spices in Iraq",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "Al-Tabakh Premium Catalog",
    description: "Premium food products since 1999 - Malek Al-Tabakh Company for food supplies and spices in Iraq",
    url: "https://al-tabakh-v3.vercel.app",
    siteName: "Al-Tabakh",
    locale: "ar_IQ",
    type: "website",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D11D1D",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let phone = "+9647733310100"
  let waUrl = "https://wa.me/9647733310100"
  try {
    const client = getAdminClient()
    const { data } = await client.from("site_settings").select("value").eq("key", "whatsapp").single()
    if (data?.value) {
      const w = data.value as { numbers?: { phone: string }[]; orderTarget?: string }
      const p = w.orderTarget || w.numbers?.[0]?.phone || phone
      phone = p
      waUrl = `https://wa.me/${p.replace(/[^0-9]/g, "")}`
    }
  } catch {}

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} ${notoSansArabic.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Malek Al-Tabakh",
            url: "https://al-tabakh-v3.vercel.app",
            logo: "https://al-tabakh-v3.vercel.app/favicon.svg",
            description: "Premium food products since 1999 - Malek Al-Tabakh Company for food supplies and spices in Iraq",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: phone,
              contactType: "customer service",
            },
            sameAs: [waUrl],
          }),
        }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
        <ErrorBoundary>
        <PageTransition>
        {children}
        </PageTransition>
        </ErrorBoundary>
        <Analytics />
        <ServiceWorkerRegister />
        <WhatsAppButton />
        <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
