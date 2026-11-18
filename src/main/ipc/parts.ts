import { BrowserWindow, ipcMain } from 'electron'
import { asc, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  MaterialCategorySchema,
  PartCreateSchema,
  PartIdSchema,
  PartSearchSchema,
  PartUpdateSchema,
  type MaterialCategory,
  type PartCreate,
  type PartDetail,
  type PartListItem,
  type PhotoResult
} from '../../shared/schemas'
import { deleteImageFile, pickAndSaveImage } from '../utils/images'
import { logger } from '../logger'

/**
 * Register flat parts CRUD + multi-photo picker.
 */
export function registerPartHandlers(): void {
  ipcMain.handle(IpcChannels.PARTS_LIST, async (_event, raw: unknown) => {
    const { query } = PartSearchSchema.parse(
      raw === undefined || raw === null
        ? {}
        : typeof raw === 'string'
          ? { query: raw }
          : raw
    )

    const db = getDb()
    const trimmed = query.trim()
    const pattern = trimmed ? `%${escapeLike(trimmed)}%` : null

    const rows = await db
      .select({
        id: schema.parts.id,
        code: schema.parts.code,
        name: schema.parts.name,
        materialId: schema.parts.materialId,
        materialName: schema.materials.name,
        materialCategory: schema.materials.category,
        materialColor: schema.materials.color,
        workpieceTypeId: schema.parts.workpieceTypeId,
        workpieceTypeName: schema.workpieceTypes.name,
        notes: schema.parts.notes,
        createdAt: schema.parts.createdAt,
        updatedAt: schema.parts.updatedAt
      })
      .from(schema.parts)
      .leftJoin(schema.materials, eq(schema.parts.materialId, schema.materials.id))
      .leftJoin(schema.workpieceTypes, eq(schema.parts.workpieceTypeId, schema.workpieceTypes.id))
      .where(
        pattern
          ? or(
              ilike(schema.parts.code, pattern),
              ilike(schema.parts.name, pattern),
              ilike(schema.materials.name, pattern)
            )
          : undefined
      )
      .orderBy(sql`lower(${schema.parts.code})`)

    const result: PartListItem[] = []
    for (const row of rows) {
      result.push(mapPartRow(row, await loadPhotoPaths(row.id)))
    }
    return result
  })

  ipcMain.handle(IpcChannels.PARTS_GET, async (_event, raw: unknown) => {
    const { id } = PartIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    return loadPartDetail(id)
  })

  ipcMain.handle(IpcChannels.PARTS_CREATE, async (_event, raw: unknown) => {
    const data = PartCreateSchema.parse(raw)
    const id = await persistPart(null, data)
    const detail = await loadPartDetail(id)
    if (!detail) throw new Error('Failed to load created part')
    return detail
  })

  ipcMain.handle(IpcChannels.PARTS_UPDATE, async (_event, raw: unknown) => {
    const data = PartUpdateSchema.parse(raw)
    const existing = await getDb()
      .select()
      .from(schema.parts)
      .where(eq(schema.parts.id, data.id))
      .limit(1)
    if (!existing[0]) {
      throw new Error(`Part ${data.id} not found`)
    }
    await persistPart(data.id, data)
    const detail = await loadPartDetail(data.id)
    if (!detail) throw new Error('Failed to load updated part')
    return detail
  })

  ipcMain.handle(IpcChannels.PARTS_DELETE, async (_event, raw: unknown) => {
    const { id } = PartIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const photos = await loadPhotoPaths(id)
    await getDb().delete(schema.parts).where(eq(schema.parts.id, id))
    for (const path of photos) {
      deleteImageFile(path)
    }
    return { success: true }
  })

  ipcMain.handle(IpcChannels.PARTS_PICK_PHOTO, async (event): Promise<PhotoResult> => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return pickAndSaveImage(win, {
      title: 'Вибрати фото деталі',
      subdir: 'parts',
      multiple: true
    })
  })
}

async function persistPart(existingId: number | null, data: PartCreate): Promise<number> {
  const db = getDb()
  const now = new Date().toISOString()

  await assertCatalogRefs(data.materialId ?? null, data.workpieceTypeId ?? null)

  const oldPhotos = existingId != null ? await loadPhotoPaths(existingId) : []
  const newPhotos = data.photoPaths ?? []

  const partId = await db.transaction(async (tx) => {
    let id: number

    if (existingId == null) {
      const [inserted] = await tx
        .insert(schema.parts)
        .values({
          code: data.code,
          name: data.name,
          materialId: data.materialId ?? null,
          workpieceTypeId: data.workpieceTypeId ?? null,
          notes: data.notes ?? '',
          createdAt: now,
          updatedAt: now
        })
        .returning({ id: schema.parts.id })
      id = inserted.id
    } else {
      await tx
        .update(schema.parts)
        .set({
          code: data.code,
          name: data.name,
          materialId: data.materialId ?? null,
          workpieceTypeId: data.workpieceTypeId ?? null,
          notes: data.notes ?? '',
          updatedAt: now
        })
        .where(eq(schema.parts.id, existingId))

      await tx.delete(schema.partPhotos).where(eq(schema.partPhotos.partId, existingId))
      id = existingId
    }

    for (let index = 0; index < newPhotos.length; index++) {
      await tx.insert(schema.partPhotos).values({
        partId: id,
        photoPath: newPhotos[index],
        sortOrder: index
      })
    }

    return id
  })

  const kept = new Set(newPhotos)
  for (const path of oldPhotos) {
    if (!kept.has(path)) {
      deleteImageFile(path)
    }
  }

  logger.info(existingId == null ? 'Part created:' : 'Part updated:', partId)
  return partId
}

async function loadPartDetail(id: number): Promise<PartDetail | null> {
  const rows = await getDb()
    .select({
      id: schema.parts.id,
      code: schema.parts.code,
      name: schema.parts.name,
      materialId: schema.parts.materialId,
      materialName: schema.materials.name,
      materialCategory: schema.materials.category,
      materialColor: schema.materials.color,
      workpieceTypeId: schema.parts.workpieceTypeId,
      workpieceTypeName: schema.workpieceTypes.name,
      notes: schema.parts.notes,
      createdAt: schema.parts.createdAt,
      updatedAt: schema.parts.updatedAt
    })
    .from(schema.parts)
    .leftJoin(schema.materials, eq(schema.parts.materialId, schema.materials.id))
    .leftJoin(schema.workpieceTypes, eq(schema.parts.workpieceTypeId, schema.workpieceTypes.id))
    .where(eq(schema.parts.id, id))
    .limit(1)

  const row = rows[0]
  return row ? mapPartRow(row, await loadPhotoPaths(id)) : null
}

async function loadPhotoPaths(partId: number): Promise<string[]> {
  const rows = await getDb()
    .select({ photoPath: schema.partPhotos.photoPath })
    .from(schema.partPhotos)
    .where(eq(schema.partPhotos.partId, partId))
    .orderBy(asc(schema.partPhotos.sortOrder), asc(schema.partPhotos.id))
  return rows.map((r) => r.photoPath)
}

function mapPartRow(
  row: {
    id: number
    code: string
    name: string
    materialId: number | null
    materialName: string | null
    materialCategory: string | null
    materialColor: string | null
    workpieceTypeId: number | null
    workpieceTypeName: string | null
    notes: string
    createdAt: string
    updatedAt: string
  },
  photoPaths: string[]
): PartListItem {
  let materialCategory: MaterialCategory | null = null
  if (row.materialCategory) {
    const parsed = MaterialCategorySchema.safeParse(row.materialCategory)
    materialCategory = parsed.success ? parsed.data : 'P'
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    materialId: row.materialId,
    materialName: row.materialName ?? null,
    materialCategory,
    materialColor: row.materialColor ?? null,
    workpieceTypeId: row.workpieceTypeId,
    workpieceTypeName: row.workpieceTypeName ?? null,
    notes: row.notes,
    photoPaths,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

async function assertCatalogRefs(
  materialId: number | null,
  workpieceTypeId: number | null
): Promise<void> {
  const db = getDb()
  if (materialId != null) {
    const material = await db
      .select({ id: schema.materials.id })
      .from(schema.materials)
      .where(eq(schema.materials.id, materialId))
      .limit(1)
    if (!material[0]) {
      throw new Error(`Material ${materialId} not found`)
    }
  }
  if (workpieceTypeId != null) {
    const wt = await db
      .select({ id: schema.workpieceTypes.id })
      .from(schema.workpieceTypes)
      .where(eq(schema.workpieceTypes.id, workpieceTypeId))
      .limit(1)
    if (!wt[0]) {
      throw new Error(`Workpiece type ${workpieceTypeId} not found`)
    }
  }
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '')
}
