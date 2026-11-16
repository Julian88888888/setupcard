import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { runMigrations } from './migrate'
import { logger } from '../logger'

export type AppDatabase = BetterSQLite3Database<typeof schema>

let sqlite: Database.Database | null = null
let db: AppDatabase | null = null

/** Absolute path to the SQLite file: userData/app.db */
export function getDatabasePath(): string {
  return join(app.getPath('userData'), 'app.db')
}

/** Absolute path to the images directory: userData/images/ */
export function getImagesPath(): string {
  return join(app.getPath('userData'), 'images')
}

/** Absolute path for machine photos: userData/images/machines/ */
export function getMachinesImagesPath(): string {
  return join(getImagesPath(), 'machines')
}

/** Absolute path for fixture photos: userData/images/fixtures/ */
export function getFixturesImagesPath(): string {
  return join(getImagesPath(), 'fixtures')
}

/** Absolute path for transition photos: userData/images/transitions/ */
export function getTransitionsImagesPath(): string {
  return join(getImagesPath(), 'transitions')
}

/**
 * Open (or create) the database, enable WAL, run migrations, ensure images dir exists.
 * Call once during app startup before registering IPC handlers.
 */
export function initDatabase(): AppDatabase {
  if (db) return db

  const dbPath = getDatabasePath()
  const imagesPath = getImagesPath()
  const machinesImagesPath = getMachinesImagesPath()
  const fixturesImagesPath = getFixturesImagesPath()
  const transitionsImagesPath = getTransitionsImagesPath()

  mkdirSync(app.getPath('userData'), { recursive: true })
  mkdirSync(imagesPath, { recursive: true })
  mkdirSync(machinesImagesPath, { recursive: true })
  mkdirSync(fixturesImagesPath, { recursive: true })
  mkdirSync(transitionsImagesPath, { recursive: true })

  logger.info('Opening database:', dbPath)
  sqlite = new Database(dbPath)

  // Performance / durability balance for desktop apps
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('synchronous = NORMAL')
  sqlite.pragma('foreign_keys = ON')

  runMigrations(sqlite)

  db = drizzle(sqlite, { schema })
  logger.info('Database ready')
  return db
}

export function getDb(): AppDatabase {
  if (!db) {
    throw new Error('Database not initialized — call initDatabase() first')
  }
  return db
}

/** Close the connection cleanly (e.g. before backup import or app quit). */
export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
    logger.info('Database closed')
  }
}

export { schema }
