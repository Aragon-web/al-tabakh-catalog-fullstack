import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase"
import { COUNTRIES as staticCountries } from "@/lib/cities"

export async function GET() {
  try {
    const client = getAdminClient()
    const { data } = await client.from("settings").select("value").eq("key", "locations_countries").maybeSingle()
    if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
      return NextResponse.json(data.value)
    }
  } catch {}
  return NextResponse.json(staticCountries)
}
