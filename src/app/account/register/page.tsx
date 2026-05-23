import type { Metadata } from "next"
import { StoreProvider } from "@/lib/store"
import { RegisterClient } from "./register-client"

export const metadata: Metadata = { title: "Register", description: "Create your Al-Tabakh account." }

export default function RegisterPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <RegisterClient />
    </StoreProvider>
  )
}