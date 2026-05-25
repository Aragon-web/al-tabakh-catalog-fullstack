import type { Metadata } from "next"
import { ForgotPasswordClient } from "./client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Forgot Password | Al-Tabakh",
  description: "Reset your Al-Tabakh account password.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
