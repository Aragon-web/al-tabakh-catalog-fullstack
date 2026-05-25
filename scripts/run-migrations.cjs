const { Client } = require("pg")
const fs = require("fs")
const path = require("path")

const ref = "gatrjlwzbmblmxcayyyl"
const password = "Crushea@57"
const url = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

async function run() {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 15000 })
  await client.connect()

  // Check what's already in schema_migrations
  const { rows: existing } = await client.query(
    "SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version"
  )
  console.log("Already applied migrations:")
  for (const r of existing) {
    console.log(`  ${r.version} ${r.name}`)
  }
  const existingVersions = new Set(existing.map(r => String(r.version)))

  // Find new migration files that haven't been applied
  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations")
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort()

  console.log("\nApplying new migrations:")
  for (const file of files) {
    const version = file.split("_")[0]
    if (existingVersions.has(version)) {
      console.log(`  SKIP ${file} (already applied)`)
      continue
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
    const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0)
    console.log(`  RUN ${file} (${statements.length} statements)...`)
    try {
      for (const stmt of statements) {
        await client.query(stmt + ";")
      }
      // Record in schema_migrations
      await client.query(
        "INSERT INTO supabase_migrations.schema_migrations(version, name, statements) VALUES($1, $2, $3)",
        [version, file, statements]
      )
      console.log(`  OK ${file}`)
    } catch (err) {
      if (err.code === "42P07" || err.message?.includes("already exists")) {
        console.log(`  SKIP (table exists)`)
        // Still record it
        await client.query(
          "INSERT INTO supabase_migrations.schema_migrations(version, name, statements) VALUES($1, $2, $3) ON CONFLICT (version) DO NOTHING",
          [version, file, statements]
        )
      } else {
        console.error(`  FAIL: ${err.message}`)
      }
    }
  }

  await client.end()
  console.log("\nDone.")
}

run().catch(err => { console.error(err); process.exit(1) })
