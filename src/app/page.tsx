import { headers } from "next/headers"
import { StoreProvider } from "@/lib/store"
import { ClientPage } from "./client-page"
import type { Product, Category } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  let products: Product[] = []
  let categories: Category[] = []

  try {
    const [pRes, cRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, { next: { revalidate: 0 } }),
      fetch(`${baseUrl}/api/categories`, { next: { revalidate: 0 } }),
    ])
    if (pRes.ok) products = await pRes.json()
    if (cRes.ok) categories = await cRes.json()
  } catch {
    // fallback to empty
  }

  return (
    <StoreProvider products={products} categories={categories}>
      <ClientPage />
    </StoreProvider>
  )
}
