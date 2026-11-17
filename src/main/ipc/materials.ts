import { ipcMain } from 'electron'
import { count, eq, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  MaterialCreateSchema,
  MaterialIdSchema,
  MaterialUpdateSchema,
  type Material,
  type MaterialCategory
} from '../../shared/schemas'
import { logger } from '../logger'

export function registerMaterialHandlers(): void {
  ipcMain.handle(IpcChannels.MATERIALS_LIST, async () => {
    const rows = getDb()
      .select()
      .from(schema.materials)
      .orderBy(sql`${schema.materials.name} COLLATE NOCASE`)
      .all()
    return rows.map(mapMaterial)
  })

  ipcMain.handle(IpcChannels.MATERIALS_CREATE, async (_event, raw: unknown) => {
    const data = MaterialCreateSchema.parse(raw)
    const now = new Date().toISOString()
    try {
      const row = getDb()
        .insert(schema.materials)
        .values({
          name: data.name.trim(),
          category: data.category,
          notes: data.notes ?? '',
          createdAt: now,
          updatedAt: now
        })
        .returning()
        .get()
      logger.info('Material created:', row.id)
      return mapMaterial(row)
    } catch (err) {
      throw uniqueNameError(err, 'Матеріал з такою назвою вже існує')
    }
  })

  ipcMain.handle(IpcChannels.MATERIALS_UPDATE, async (_event, raw: unknown) => {
    const data = MaterialUpdateSchema.parse(raw)
    const existing = getDb()
      .select()
      .from(schema.materials)
      .where(eq(schema.materials.id, data.id))
      .get()
    if (!existing) {
      throw new Error(`Material ${data.id} not found`)
    }

    const now = new Date().toISOString()
    try {
      const row = getDb()
        .update(schema.materials)
        .set({
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(data.category !== undefined ? { category: data.category } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          updatedAt: now
        })
        .where(eq(schema.materials.id, data.id))
        .returning()
        .get()
      return mapMaterial(row)
    } catch (err) {
      throw uniqueNameError(err, 'Матеріал з такою назвою вже існує')
    }
  })

  ipcMain.handle(IpcChannels.MATERIALS_DELETE, async (_event, raw: unknown) => {
    const { id } = MaterialIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const usage =
      getDb()
        .select({ value: count() })
        .from(schema.parts)
        .where(eq(schema.parts.materialId, id))
        .get()?.value ?? 0

    if (usage > 0) {
      throw new Error(`Неможливо видалити: матеріал використовується в ${usage} детал(ях)`)
    }

    getDb().delete(schema.materials).where(eq(schema.materials.id, id)).run()
    return { success: true }
  })
}

function mapMaterial(row: typeof schema.materials.$inferSelect): Material {
  return {
    id: row.id,
    name: row.name,
    category: row.category as MaterialCategory,
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
