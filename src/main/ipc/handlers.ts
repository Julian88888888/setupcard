import { ipcMain, BrowserWindow } from 'electron'
import { eq } from 'drizzle-orm'
import { getDb, getDatabasePath, getImagesPath, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  SettingsSchema,
  SettingsUpdateSchema,
  ItemCreateSchema,
  ItemUpdateSchema,
  ItemIdSchema,
  type Settings,
  type Item
} from '../../shared/schemas'
import { exportBackup, importBackup } from './backup'
import { logger } from '../logger'
import { app } from 'electron'

const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({})

/**
 * Register all IPC handlers. Every payload from the renderer is validated with Zod.
 */
export function registerIpcHandlers(): void {
  // ── Settings ──────────────────────────────────────────────────────────────

  ipcMain.handle(IpcChannels.SETTINGS_GET, async () => {
    return readSettings()
  })

  ipcMain.handle(IpcChannels.SETTINGS_SET, async (_event, raw: unknown) => {
    const update = SettingsUpdateSchema.parse(raw)
    const current = readSettings()
    const next: Settings = { ...current, ...update }
    writeSettings(next)
    return next
  })

  // ── Items CRUD ────────────────────────────────────────────────────────────

  ipcMain.handle(IpcChannels.ITEMS_LIST, async () => {
    const rows = getDb().select().from(schema.items).all()
    return rows.map(mapItem)
  })

  ipcMain.handle(IpcChannels.ITEMS_GET, async (_event, raw: unknown) => {
    const { id } = ItemIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const row = getDb().select().from(schema.items).where(eq(schema.items.id, id)).get()
    return row ? mapItem(row) : null
  })

  ipcMain.handle(IpcChannels.ITEMS_CREATE, async (_event, raw: unknown) => {
    const data = ItemCreateSchema.parse(raw)
    const now = new Date().toISOString()
    const result = getDb()
      .insert(schema.items)
      .values({
        title: data.title,
        description: data.description ?? '',
        imagePath: data.imagePath ?? null,
        createdAt: now,
        updatedAt: now
      })
      .returning()
      .get()
    return mapItem(result)
  })

  ipcMain.handle(IpcChannels.ITEMS_UPDATE, async (_event, raw: unknown) => {
    const data = ItemUpdateSchema.parse(raw)
    const { id, ...fields } = data
    const existing = getDb().select().from(schema.items).where(eq(schema.items.id, id)).get()
    if (!existing) {
      throw new Error(`Item ${id} not found`)
    }

    const result = getDb()
      .update(schema.items)
      .set({
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.description !== undefined ? { description: fields.description } : {}),
        ...(fields.imagePath !== undefined ? { imagePath: fields.imagePath } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.items.id, id))
      .returning()
      .get()

    return mapItem(result)
  })

  ipcMain.handle(IpcChannels.ITEMS_DELETE, async (_event, raw: unknown) => {
    const { id } = ItemIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    getDb().delete(schema.items).where(eq(schema.items.id, id)).run()
    return { success: true }
  })

  // ── Backup ────────────────────────────────────────────────────────────────

  ipcMain.handle(IpcChannels.BACKUP_EXPORT, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return exportBackup(win)
  })

  ipcMain.handle(IpcChannels.BACKUP_IMPORT, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return importBackup(win)
  })

  // ── App paths ─────────────────────────────────────────────────────────────

  ipcMain.handle(IpcChannels.APP_GET_PATHS, async () => {
    return {
      userData: app.getPath('userData'),
      images: getImagesPath(),
      database: getDatabasePath()
    }
  })

  logger.info('IPC handlers registered')
}

function readSettings(): Settings {
  const rows = getDb().select().from(schema.settings).all()
  const map = Object.fromEntries(rows.map((r) => [r.key, safeJsonParse(r.value)]))
  return SettingsSchema.parse({ ...DEFAULT_SETTINGS, ...map })
}

function writeSettings(settings: Settings): void {
  const db = getDb()
  // Persist each top-level key as its own row
  for (const [key, value] of Object.entries(settings)) {
    db.insert(schema.settings)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: JSON.stringify(value) }
      })
      .run()
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function mapItem(row: typeof schema.items.$inferSelect): Item {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imagePath: row.imagePath,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
