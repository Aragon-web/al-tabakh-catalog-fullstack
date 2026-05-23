import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { FaqClient } from "./faq-client"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about ordering from Al-Tabakh — delivery, returns, and customer support.",
  openGraph: { title: "FAQ | Al-Tabakh", description: "Frequently asked questions about ordering from Al-Tabakh." },
}

export default function FaqPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <FaqClient />
    </StoreProvider>
  )
}
