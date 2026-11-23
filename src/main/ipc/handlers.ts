import { ipcMain, BrowserWindow } from 'electron'
import { getDb, getDatabaseUrlForDisplay, getImagesPath, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  SettingsSchema,
  SettingsUpdateSchema,
  type Settings
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

