import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { AboutClient } from "./about-client"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Malek Al-Tabakh Company — our story, mission, and values since 1999. Iraq's trusted food supply partner.",
  openGraph: { title: "About Us | Al-Tabakh", description: "Learn about Malek Al-Tabakh Company — our story, mission, and values since 1999." },
}

export default function AboutPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <AboutClient />
    </StoreProvider>
  )
}
