import { StoreProvider } from "@/lib/store"
import type { Product, Category } from "@/lib/types"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider products={[] as Product[]} categories={[] as Category[]}>
      {children}
    </StoreProvider>
  )
}
