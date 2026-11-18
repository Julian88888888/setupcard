import { randomUUID } from 'crypto'
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { extname, join } from 'path'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import { eq, like, or, sql } from 'drizzle-orm'
import { getDb, getImagesPath, getMachinesImagesPath, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  MachineCreateSchema,
  MachineIdSchema,
  MachineSearchSchema,
  MachineUpdateSchema,
  type Machine,
  type MachinePhotoResult
} from '../../shared/schemas'
import { logger } from '../logger'

const ALLOWED_PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'])

/**
 * Register machine CRUD + photo picker handlers.
 */
export function registerMachineHandlers(): void {
  ipcMain.handle(IpcChannels.MACHINES_LIST, async (_event, raw: unknown) => {
    const { query } = MachineSearchSchema.parse(
      raw === undefined || raw === null
        ? {}
        : typeof raw === 'string'
          ? { query: raw }
          : raw
    )

    const db = getDb()
    const trimmed = query.trim()

    if (!trimmed) {
      return db
        .select()
        .from(schema.machines)
        .orderBy(sql`${schema.machines.name} COLLATE NOCASE`)
        .all()
        .map(mapMachine)
    }

    const pattern = `%${escapeLike(trimmed)}%`
    return db
      .select()
      .from(schema.machines)
      .where(
        or(
          like(schema.machines.name, pattern),
          like(schema.machines.inventoryNumber, pattern)
        )
      )
      .orderBy(sql`${schema.machines.name} COLLATE NOCASE`)
      .all()
      .map(mapMachine)
  })

  ipcMain.handle(IpcChannels.MACHINES_GET, async (_event, raw: unknown) => {
    const { id } = MachineIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const row = getDb().select().from(schema.machines).where(eq(schema.machines.id, id)).get()
    return row ? mapMachine(row) : null
  })

  ipcMain.handle(IpcChannels.MACHINES_CREATE, async (_event, raw: unknown) => {
    const data = MachineCreateSchema.parse(raw)
    const now = new Date().toISOString()
    const result = getDb()
      .insert(schema.machines)
      .values({
        name: data.name,
        inventoryNumber: data.inventoryNumber,
        machineType: data.machineType ?? '',
        controlSystemType: data.controlSystemType ?? '',
        spindleTaper: data.spindleTaper ?? '',
        maxSpindleSpeed: data.maxSpindleSpeed ?? null,
        magazineCapacity: data.magazineCapacity ?? null,
        maxToolLength: data.maxToolLength ?? '',
        maxToolDiameter: data.maxToolDiameter ?? '',
        maxToolWeight: data.maxToolWeight ?? null,
        tableSize: data.tableSize ?? '',
        axisTravel: data.axisTravel ?? '',
        tableLoadCapacity: data.tableLoadCapacity ?? null,
        maxWorkpieceSize: data.maxWorkpieceSize ?? '',
        numberOfTables: data.numberOfTables ?? null,
        photoPath: data.photoPath ?? null,
        notes: data.notes ?? '',
        createdAt: now,
        updatedAt: now
      })
      .returning()
      .get()

    return mapMachine(result)
  })

  ipcMain.handle(IpcChannels.MACHINES_UPDATE, async (_event, raw: unknown) => {
    const data = MachineUpdateSchema.parse(raw)
    const { id, ...fields } = data
    const existing = getDb().select().from(schema.machines).where(eq(schema.machines.id, id)).get()
    if (!existing) {
      throw new Error(`Machine ${id} not found`)
    }

    const nextPhotoPath =
      fields.photoPath !== undefined ? fields.photoPath : existing.photoPath

    const result = getDb()
      .update(schema.machines)
      .set({
        ...(fields.name !== undefined ? { name: fields.name } : {}),
        ...(fields.inventoryNumber !== undefined
          ? { inventoryNumber: fields.inventoryNumber }
          : {}),
        ...(fields.machineType !== undefined ? { machineType: fields.machineType } : {}),
        ...(fields.controlSystemType !== undefined
          ? { controlSystemType: fields.controlSystemType }
          : {}),
        ...(fields.spindleTaper !== undefined ? { spindleTaper: fields.spindleTaper } : {}),
        ...(fields.maxSpindleSpeed !== undefined
          ? { maxSpindleSpeed: fields.maxSpindleSpeed }
          : {}),
        ...(fields.magazineCapacity !== undefined
          ? { magazineCapacity: fields.magazineCapacity }
          : {}),
        ...(fields.maxToolLength !== undefined ? { maxToolLength: fields.maxToolLength } : {}),
        ...(fields.maxToolDiameter !== undefined
          ? { maxToolDiameter: fields.maxToolDiameter }
          : {}),
        ...(fields.maxToolWeight !== undefined ? { maxToolWeight: fields.maxToolWeight } : {}),
        ...(fields.tableSize !== undefined ? { tableSize: fields.tableSize } : {}),
        ...(fields.axisTravel !== undefined ? { axisTravel: fields.axisTravel } : {}),
        ...(fields.tableLoadCapacity !== undefined
          ? { tableLoadCapacity: fields.tableLoadCapacity }
          : {}),
        ...(fields.maxWorkpieceSize !== undefined
          ? { maxWorkpieceSize: fields.maxWorkpieceSize }
          : {}),
        ...(fields.numberOfTables !== undefined
          ? { numberOfTables: fields.numberOfTables }
          : {}),
        ...(fields.photoPath !== undefined ? { photoPath: fields.photoPath } : {}),
        ...(fields.notes !== undefined ? { notes: fields.notes } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.machines.id, id))
      .returning()
      .get()

    // Remove previous photo file when path changed or cleared
    if (
      fields.photoPath !== undefined &&
      existing.photoPath &&
      existing.photoPath !== nextPhotoPath
    ) {
      deleteImageFile(existing.photoPath)
    }

    return mapMachine(result)
  })

  ipcMain.handle(IpcChannels.MACHINES_DELETE, async (_event, raw: unknown) => {
    const { id } = MachineIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const existing = getDb().select().from(schema.machines).where(eq(schema.machines.id, id)).get()
    if (existing?.photoPath) {
      deleteImageFile(existing.photoPath)
    }
    getDb().delete(schema.machines).where(eq(schema.machines.id, id)).run()
    return { success: true }
  })

  ipcMain.handle(IpcChannels.MACHINES_PICK_PHOTO, async (event): Promise<MachinePhotoResult> => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options = {
      title: 'Вибрати фото верстата',
      properties: ['openFile' as const],
      filters: [
        { name: 'Зображення', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] }
      ]
    }

    const { filePaths, canceled } = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)

    if (canceled || !filePaths?.[0]) {
      return { success: false, error: 'cancelled' }
    }

    const sourcePath = filePaths[0]
    const ext = extname(sourcePath).toLowerCase()
    if (!ALLOWED_PHOTO_EXTENSIONS.has(ext)) {
      return { success: false, error: 'Непідтримуваний формат зображення' }
    }

    try {
      const machinesDir = getMachinesImagesPath()
      mkdirSync(machinesDir, { recursive: true })

      const fileName = `${randomUUID()}${ext}`
      const destAbs = join(machinesDir, fileName)
      copyFileSync(sourcePath, destAbs)

      const relativePath = join('machines', fileName).replace(/\\/g, '/')
      logger.info('Machine photo saved:', relativePath)
      return { success: true, path: relativePath }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error('Failed to save machine photo:', message)
      return { success: false, error: message }
    }
  })
}

function mapMachine(row: typeof schema.machines.$inferSelect): Machine {
  return {
    id: row.id,
    name: row.name,
    inventoryNumber: row.inventoryNumber,
    machineType: row.machineType,
    controlSystemType: row.controlSystemType,
    spindleTaper: row.spindleTaper,
    maxSpindleSpeed: row.maxSpindleSpeed,
    magazineCapacity: row.magazineCapacity,
    maxToolLength: row.maxToolLength,
    maxToolDiameter: row.maxToolDiameter,
    maxToolWeight: row.maxToolWeight,
    tableSize: row.tableSize,
    axisTravel: row.axisTravel,
    tableLoadCapacity: row.tableLoadCapacity,
    maxWorkpieceSize: row.maxWorkpieceSize,
    numberOfTables: row.numberOfTables,
    photoPath: row.photoPath,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

function deleteImageFile(relativePath: string): void {
  try {
    const abs = join(getImagesPath(), relativePath)
    if (existsSync(abs)) {
      unlinkSync(abs)
    }
  } catch (err) {
    logger.warn('Could not delete image file:', relativePath, err)
  }
}

/** Escape LIKE wildcards so user input is treated literally. */
function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '')
}
