import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { LoyaltyClient } from "./loyalty-client"

export const metadata: Metadata = {
  title: "Loyalty Program",
  description: "Earn points with every purchase at Al-Tabakh. Join our loyalty program for exclusive rewards and discounts.",
  openGraph: { title: "Loyalty Program | Al-Tabakh", description: "Earn points with every purchase at Al-Tabakh." },
}

export default function LoyaltyPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <LoyaltyClient />
    </StoreProvider>
  )
}
