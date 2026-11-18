import { app } from 'electron'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'
import type { Pool } from 'pg'
import { logger } from '../logger'

/**
 * Apply SQL migrations from the migrations folder.
 *
 * Dev:  src/main/db/migrations
 * Prod: resources/migrations (electron-builder extraResources)
 */
export async function runMigrations(pool: Pool): Promise<void> {
  const migrationsPath = resolveMigrationsPath()
  logger.info('Running migrations from:', migrationsPath)

  if (!existsSync(migrationsPath)) {
    logger.warn('Migrations folder not found — skipping')
    return
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `)

  const appliedResult = await pool.query<{ hash: string }>(
    'SELECT hash FROM __drizzle_migrations'
  )
  const applied = new Set(appliedResult.rows.map((r) => r.hash))

  const files = readdirSync(migrationsPath)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const hash = file.replace(/\.sql$/, '')
    if (applied.has(hash)) {
      logger.debug('Migration already applied:', file)
      continue
    }

    const sql = readFileSync(join(migrationsPath, file), 'utf-8')
    const statements = sql
      .split(/-->\s*statement-breakpoint/)
      .map((s) => s.trim())
      .filter(Boolean)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const statement of statements) {
        await client.query(statement)
      }
      await client.query(
        'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        [hash, Date.now()]
      )
      await client.query('COMMIT')
      logger.info('Applied migration:', file)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

function resolveMigrationsPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'migrations')
  }
  return join(app.getAppPath(), 'src', 'main', 'db', 'migrations')
}
