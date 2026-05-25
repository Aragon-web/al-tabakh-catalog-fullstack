import { getAdminClient } from "./supabase"

export async function logAdminAction(action: string, entityType: string, entityId: string, details: Record<string, unknown> = {}) {
  try {
    const client = getAdminClient()
    await client.from("admin_logs").insert({
      admin_action: action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    })
  } catch (e) {
    console.error("Failed to log admin action:", e)
  }
}
