import { app } from 'electron'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'
import type Database from 'better-sqlite3'
import { logger } from '../logger'

/**
 * Apply SQL migrations from the migrations folder.
 *
 * Dev:  src/main/db/migrations (relative to project root via app.getAppPath)
 * Prod: resources/migrations (copied via electron-builder extraResources)
 *
 * Uses a simple __drizzle_migrations tracking table compatible with drizzle-kit output.
 */
export function runMigrations(sqlite: Database.Database): void {
  const migrationsPath = resolveMigrationsPath()
  logger.info('Running migrations from:', migrationsPath)

  if (!existsSync(migrationsPath)) {
    logger.warn('Migrations folder not found — skipping')
    return
  }

  // Track applied migrations (mirrors drizzle-orm/better-sqlite3 migrator)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER
    )
  `)

  const applied = new Set(
    (
      sqlite.prepare('SELECT hash FROM __drizzle_migrations').all() as Array<{ hash: string }>
    ).map((r) => r.hash)
  )

  // Drizzle-kit emits numbered SQL files: 0000_*.sql, 0001_*.sql, …
  const files = readdirSync(migrationsPath)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const insertMigration = sqlite.prepare(
    'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)'
  )

  for (const file of files) {
    const hash = file.replace(/\.sql$/, '')
    if (applied.has(hash)) {
      logger.debug('Migration already applied:', file)
      continue
    }

    const sql = readFileSync(join(migrationsPath, file), 'utf-8')
    // Split on drizzle statement breakpoint comments
    const statements = sql
      .split(/-->\s*statement-breakpoint/)
      .map((s) => s.trim())
      .filter(Boolean)

    const apply = sqlite.transaction(() => {
      for (const statement of statements) {
        sqlite.exec(statement)
      }
      insertMigration.run(hash, Date.now())
    })

    apply()
    logger.info('Applied migration:', file)
  }
}

function resolveMigrationsPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'migrations')
  }
  // electron-vite: app path points at the project root in dev
  return join(app.getAppPath(), 'src', 'main', 'db', 'migrations')
}
