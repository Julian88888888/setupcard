import { ipcMain, BrowserWindow } from 'electron'
import { eq } from 'drizzle-orm'
import { getDb, getDatabaseUrlForDisplay, getImagesPath, schema } from '../db'
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
import { registerMachineHandlers } from './machines'
import { registerMaterialHandlers } from './materials'
import { registerPartHandlers } from './parts'
import { registerWorkpieceTypeHandlers } from './workpiece-types'
import { logger } from '../logger'
import { app } from 'electron'

const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({})

/**
 * Register all IPC handlers. Every payload from the renderer is validated with Zod.
 */
export function registerIpcHandlers(): void {
  // ── Settings ──────────────────────────────────────────────────────────────

  ipcMain.handle(IpcChannels.SETTINGS_GET, async () => {
    return await readSettings()
  })

  ipcMain.handle(IpcChannels.SETTINGS_SET, async (_event, raw: unknown) => {
    const update = SettingsUpdateSchema.parse(raw)
    const current = await readSettings()
    const next: Settings = { ...current, ...update }
    await writeSettings(next)
    return next
  })

  // ── Items CRUD ────────────────────────────────────────────────────────────

  ipcMain.handle(IpcChannels.ITEMS_LIST, async () => {
    const rows = await getDb().select().from(schema.items)
    return rows.map(mapItem)
  })

  ipcMain.handle(IpcChannels.ITEMS_GET, async (_event, raw: unknown) => {
    const { id } = ItemIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const rows = await getDb().select().from(schema.items).where(eq(schema.items.id, id)).limit(1)
    return rows[0] ? mapItem(rows[0]) : null
  })

  ipcMain.handle(IpcChannels.ITEMS_CREATE, async (_event, raw: unknown) => {
    const data = ItemCreateSchema.parse(raw)
    const now = new Date().toISOString()
    const [result] = await getDb()
      .insert(schema.items)
      .values({
        title: data.title,
        description: data.description ?? '',
        imagePath: data.imagePath ?? null,
        createdAt: now,
        updatedAt: now
      })
      .returning()
    return mapItem(result)
  })

  ipcMain.handle(IpcChannels.ITEMS_UPDATE, async (_event, raw: unknown) => {
    const data = ItemUpdateSchema.parse(raw)
    const { id, ...fields } = data
    const existing = await getDb()
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, id))
      .limit(1)
    if (!existing[0]) {
      throw new Error(`Item ${id} not found`)
    }

    const [result] = await getDb()
      .update(schema.items)
      .set({
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.description !== undefined ? { description: fields.description } : {}),
        ...(fields.imagePath !== undefined ? { imagePath: fields.imagePath } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.items.id, id))
      .returning()

    return mapItem(result)
  })

  ipcMain.handle(IpcChannels.ITEMS_DELETE, async (_event, raw: unknown) => {
    const { id } = ItemIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    await getDb().delete(schema.items).where(eq(schema.items.id, id))
    return { success: true }
  })

  // ── Machines ──────────────────────────────────────────────────────────────

  registerMachineHandlers()

  // ── Catalogs ──────────────────────────────────────────────────────────────

  registerMaterialHandlers()
  registerWorkpieceTypeHandlers()

  // ── Parts ─────────────────────────────────────────────────────────────────

  registerPartHandlers()

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
      database: getDatabaseUrlForDisplay()
    }
  })

  logger.info('IPC handlers registered')
}

async function readSettings(): Promise<Settings> {
  const rows = await getDb().select().from(schema.settings)
  const map = Object.fromEntries(rows.map((r) => [r.key, safeJsonParse(r.value)]))
  return SettingsSchema.parse({ ...DEFAULT_SETTINGS, ...map })
}

async function writeSettings(settings: Settings): Promise<void> {
  const db = getDb()
  for (const [key, value] of Object.entries(settings)) {
    await db
      .insert(schema.settings)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: JSON.stringify(value) }
      })
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
