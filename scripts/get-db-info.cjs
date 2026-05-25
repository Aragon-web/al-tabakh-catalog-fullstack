const fs = require("fs")
const path = require("path")

const email = "etsy.profile01@gmail.com"
const password = "Crushea@57"
const projectRef = "gatrjlwzbmblmxcayyyl"
const BASE = "https://api.supabase.com"

async function main() {
  // Step 1: Login to Supabase Management API
  console.log("Logging in...")
  const loginResp = await fetch(`${BASE}/v1/auth/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  if (!loginResp.ok) {
    const text = await loginResp.text()
    console.error(`Login failed: ${loginResp.status} ${text}`)
    process.exit(1)
  }
  const loginData = await loginResp.json()
  const accessToken = loginData.access_token
  console.log("Logged in successfully")

  // Step 2: Get project details including database info
  console.log("Fetching project info...")
  const projResp = await fetch(`${BASE}/v1/projects/${projectRef}/config/database`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!projResp.ok) {
    const text = await projResp.text()
    console.error(`Failed to get project config: ${projResp.status} ${text}`)
    process.exit(1)
  }
  const dbConfig = await projResp.json()
  console.log("DB config:", JSON.stringify(dbConfig, null, 2))

  // Step 3: Get the connection string
  const connResp = await fetch(`${BASE}/v1/projects/${projectRef}/config/database/pooler`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!connResp.ok) {
    const text = await connResp.text()
    console.error(`Failed to get pooler config: ${connResp.status} ${text}`)
    process.exit(1)
  }
  const poolerConfig = await connResp.json()
  console.log("Pooler config:", JSON.stringify(poolerConfig, null, 2))
}

main().catch(err => { console.error(err); process.exit(1) })
