import { StoreProvider } from "@/lib/store"
import { IphoneClient } from "./iphone-client"

export const dynamic = "force-dynamic"

export default function IphonePage() {
  return (
    <StoreProvider products={[]} categories={[]}>
      <IphoneClient />
    </StoreProvider>
  )
}
