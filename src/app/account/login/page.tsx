import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { LoginClient } from "./login-client"

export const metadata: Metadata = { title: "Login", description: "Login to your Al-Tabakh account." }

export default function LoginPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <LoginClient />
    </StoreProvider>
  )
}