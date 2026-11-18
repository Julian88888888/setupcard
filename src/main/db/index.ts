import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'
import { config as loadEnv } from 'dotenv'
import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { count } from 'drizzle-orm'
import * as schema from './schema'
import { runMigrations } from './migrate'
import { ISO_CATEGORY_COLORS, MATERIAL_SEED, WORKPIECE_TYPE_SEED } from './seed-catalogs'
import { logger } from '../logger'

const DEFAULT_DATABASE_URL =
  'postgresql://setupcard:setupcard@127.0.0.1:5432/setupcard'

export type AppDatabase = NodePgDatabase<typeof schema>

let pool: Pool | null = null
let db: AppDatabase | null = null

/** Load .env from project root in dev (packaged apps use process env / default). */
function loadDatabaseEnv(): void {
  if (app.isPackaged) return
  try {
    loadEnv({ path: join(app.getAppPath(), '.env') })
  } catch {
    // ignore missing .env
  }
}

/** Connection string used by the app (env or Docker Compose default). */
export function getDatabaseUrl(): string {
  loadDatabaseEnv()
  const url = process.env.DATABASE_URL?.trim()
  return url && url.length > 0 ? url : DEFAULT_DATABASE_URL
}

/** Mask password for display in Settings. */
export function getDatabaseUrlForDisplay(): string {
  const url = getDatabaseUrl()
  try {
    const parsed = new URL(url)
    if (parsed.password) {
      parsed.password = '***'
    }
    return parsed.toString()
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@')
  }
}

/** Absolute path to the images directory: userData/images/ */
export function getImagesPath(): string {
  return join(app.getPath('userData'), 'images')
}

/** Absolute path for machine photos: userData/images/machines/ */
export function getMachinesImagesPath(): string {
  return join(getImagesPath(), 'machines')
}

/** Absolute path for part photos: userData/images/parts/ */
export function getPartsImagesPath(): string {
  return join(getImagesPath(), 'parts')
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized — call initDatabase() first')
  }
  return pool
}

/**
 * Connect to PostgreSQL, run migrations, seed catalogs if empty, ensure images dirs.
 */
export async function initDatabase(): Promise<AppDatabase> {
  if (db) return db

  const imagesPath = getImagesPath()
  mkdirSync(app.getPath('userData'), { recursive: true })
  mkdirSync(imagesPath, { recursive: true })
  mkdirSync(getMachinesImagesPath(), { recursive: true })
  mkdirSync(getPartsImagesPath(), { recursive: true })

  const databaseUrl = getDatabaseUrl()
  logger.info('Connecting to PostgreSQL…')

  pool = new Pool({ connectionString: databaseUrl })

  try {
    await pool.query('SELECT 1')
  } catch (err) {
    await pool.end().catch(() => undefined)
    pool = null
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Не вдалося підключитися до PostgreSQL.\n` +
        `Запустіть Docker: npm run db:up\n` +
        `DATABASE_URL=${getDatabaseUrlForDisplay()}\n` +
        detail
    )
  }

  await runMigrations(pool)

  db = drizzle(pool, { schema })
  await seedCatalogsIfEmpty(db)

  logger.info('Database ready')
  return db
}

export function getDb(): AppDatabase {
  if (!db) {
    throw new Error('Database not initialized — call initDatabase() first')
  }
  return db
}

/** Close the pool cleanly (backup import or app quit). */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    db = null
    logger.info('Database closed')
  }
}

async function seedCatalogsIfEmpty(database: AppDatabase): Promise<void> {
  const [{ value: materialCount }] = await database
    .select({ value: count() })
    .from(schema.materials)

  if (materialCount > 0) return

  const now = new Date().toISOString()
  logger.info('Seeding material / workpiece catalogs…')

  await database.insert(schema.materials).values(
    MATERIAL_SEED.map((m) => ({
      name: m.name,
      category: m.category,
      color: ISO_CATEGORY_COLORS[m.category] ?? ISO_CATEGORY_COLORS.P,
      notes: '',
      createdAt: now,
      updatedAt: now
    }))
  )

  await database.insert(schema.workpieceTypes).values(
    WORKPIECE_TYPE_SEED.map((name) => ({
      name,
      notes: '',
      createdAt: now,
      updatedAt: now
    }))
  )
}

export { schema }
