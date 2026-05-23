import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { ProfileClient } from "./profile-client"

export const metadata: Metadata = { title: "My Account", description: "Your Al-Tabakh account profile, orders, and loyalty points." }

export default function ProfilePage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <ProfileClient />
    </StoreProvider>
  )
}