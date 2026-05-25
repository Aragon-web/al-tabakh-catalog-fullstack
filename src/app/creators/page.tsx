import { StoreProvider } from "@/lib/store"
import { CreatorsClient } from "./creators-client"

export const dynamic = "force-dynamic"

export default function CreatorsPage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <CreatorsClient />
    </StoreProvider>
  )
}
