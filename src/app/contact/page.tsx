import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { ContactClient } from "./contact-client"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Al-Tabakh — send us a message, reach us via WhatsApp, or visit our location in Erbil.",
  openGraph: { title: "Contact Us | Al-Tabakh", description: "We'd love to hear from you. Contact our team." },
}

export default function ContactPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <ContactClient />
    </StoreProvider>
  )
}