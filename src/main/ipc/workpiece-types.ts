import { ipcMain } from 'electron'
import { count, eq, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  WorkpieceTypeCreateSchema,
  WorkpieceTypeIdSchema,
  WorkpieceTypeUpdateSchema,
  type WorkpieceType
} from '../../shared/schemas'
import { logger } from '../logger'

export function registerWorkpieceTypeHandlers(): void {
  ipcMain.handle(IpcChannels.WORKPIECE_TYPES_LIST, async () => {
    const rows = await getDb()
      .select()
      .from(schema.workpieceTypes)
      .orderBy(sql`lower(${schema.workpieceTypes.name})`)
    return rows.map(mapWorkpieceType)
  })

  ipcMain.handle(IpcChannels.WORKPIECE_TYPES_CREATE, async (_event, raw: unknown) => {
    const data = WorkpieceTypeCreateSchema.parse(raw)
    const now = new Date().toISOString()
    try {
      const [row] = await getDb()
        .insert(schema.workpieceTypes)
        .values({
          name: data.name.trim(),
          notes: data.notes ?? '',
          createdAt: now,
          updatedAt: now
        })
        .returning()
      logger.info('Workpiece type created:', row.id)
      return mapWorkpieceType(row)
    } catch (err) {
      throw uniqueNameError(err, 'Тип заготовки з такою назвою вже існує')
    }
  })

  ipcMain.handle(IpcChannels.WORKPIECE_TYPES_UPDATE, async (_event, raw: unknown) => {
    const data = WorkpieceTypeUpdateSchema.parse(raw)
    const existing = await getDb()
      .select()
      .from(schema.workpieceTypes)
      .where(eq(schema.workpieceTypes.id, data.id))
      .limit(1)
    if (!existing[0]) {
      throw new Error(`Workpiece type ${data.id} not found`)
    }

    const now = new Date().toISOString()
    try {
      const [row] = await getDb()
        .update(schema.workpieceTypes)
        .set({
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          updatedAt: now
        })
        .where(eq(schema.workpieceTypes.id, data.id))
        .returning()
      return mapWorkpieceType(row)
    } catch (err) {
      throw uniqueNameError(err, 'Тип заготовки з такою назвою вже існує')
    }
  })

  ipcMain.handle(IpcChannels.WORKPIECE_TYPES_DELETE, async (_event, raw: unknown) => {
    const { id } = WorkpieceTypeIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const usageRows = await getDb()
      .select({ value: count() })
      .from(schema.parts)
      .where(eq(schema.parts.workpieceTypeId, id))
    const usage = usageRows[0]?.value ?? 0

    if (usage > 0) {
      throw new Error(`Неможливо видалити: тип заготовки використовується в ${usage} детал(ях)`)
    }

    await getDb().delete(schema.workpieceTypes).where(eq(schema.workpieceTypes.id, id))
    return { success: true }
  })
}

function mapWorkpieceType(row: typeof schema.workpieceTypes.$inferSelect): WorkpieceType {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

function uniqueNameError(err: unknown, message: string): Error {
  const text = err instanceof Error ? err.message : String(err)
  if (text.includes('UNIQUE') || text.includes('unique')) {
    return new Error(message)
  }
  return err instanceof Error ? err : new Error(text)
}
