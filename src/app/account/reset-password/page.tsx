import type { Metadata } from "next"
import { ResetPasswordClient } from "./client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Reset Password | Al-Tabakh",
  description: "Set a new password for your Al-Tabakh account.",
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
