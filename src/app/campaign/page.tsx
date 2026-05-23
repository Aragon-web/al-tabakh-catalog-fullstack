import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { CampaignClient } from "./campaign-client"

export const metadata: Metadata = {
  title: "Special Offers",
  description: "Discounted products and special offers from Al-Tabakh — limited-time deals on premium food products.",
  openGraph: { title: "Special Offers | Al-Tabakh", description: "Discounted products available for a limited time." },
}

export default function CampaignPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <CampaignClient />
    </StoreProvider>
  )
}