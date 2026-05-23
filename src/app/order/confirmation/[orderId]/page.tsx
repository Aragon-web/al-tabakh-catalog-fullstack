import type { Metadata } from "next"
import { OrderConfirmationClient } from "./client"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }): Promise<Metadata> {
  const { orderId } = await params
  return { title: `Order ${orderId} | Al-Tabakh` }
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  return <OrderConfirmationClient orderId={orderId} />
}
