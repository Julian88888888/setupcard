import { BrowserWindow, ipcMain } from 'electron'
import { asc, count, eq, like, or, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import { IpcChannels } from '../../shared/ipc-channels'
import {
  PartCreateSchema,
  PartIdSchema,
  PartSearchSchema,
  PartUpdateSchema,
  type PartCreate,
  type PartDetail,
  type PartFixture,
  type PartListItem,
  type PartProgram,
  type PartTransition,
  type PhotoResult
} from '../../shared/schemas'
import { deleteImageFile, pickAndSaveImage } from '../utils/images'
import { logger } from '../logger'

/**
 * Register parts CRUD + nested program / fixtures / transitions + photo pickers.
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

    const rows = db
      .select({
        id: schema.parts.id,
        code: schema.parts.code,
        name: schema.parts.name,
        material: schema.parts.material,
        workpieceType: schema.parts.workpieceType,
        machineId: schema.parts.machineId,
        machineName: schema.machines.name,
        notes: schema.parts.notes,
        createdAt: schema.parts.createdAt,
        updatedAt: schema.parts.updatedAt
      })
      .from(schema.parts)
      .leftJoin(schema.machines, eq(schema.parts.machineId, schema.machines.id))
      .where(
        pattern
          ? or(
              like(schema.parts.code, pattern),
              like(schema.parts.name, pattern),
              like(schema.parts.material, pattern)
            )
          : undefined
      )
      .orderBy(sql`${schema.parts.code} COLLATE NOCASE`)
      .all()

    return rows.map((row): PartListItem => {
      const fixtureCount =
        db
          .select({ value: count() })
          .from(schema.partFixtures)
          .where(eq(schema.partFixtures.partId, row.id))
          .get()?.value ?? 0
      const transitionCount =
        db
          .select({ value: count() })
          .from(schema.partTransitions)
          .where(eq(schema.partTransitions.partId, row.id))
          .get()?.value ?? 0

      return {
        id: row.id,
        code: row.code,
        name: row.name,
        material: row.material,
        workpieceType: row.workpieceType,
        machineId: row.machineId,
        machineName: row.machineName ?? null,
        notes: row.notes,
        fixtureCount,
        transitionCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }
    })
  })

  ipcMain.handle(IpcChannels.PARTS_GET, async (_event, raw: unknown) => {
    const { id } = PartIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    return loadPartDetail(id)
  })

  ipcMain.handle(IpcChannels.PARTS_CREATE, async (_event, raw: unknown) => {
    const data = PartCreateSchema.parse(raw)
    const id = persistPart(null, data)
    const detail = loadPartDetail(id)
    if (!detail) throw new Error('Failed to load created part')
    return detail
  })

  ipcMain.handle(IpcChannels.PARTS_UPDATE, async (_event, raw: unknown) => {
    const data = PartUpdateSchema.parse(raw)
    const existing = getDb().select().from(schema.parts).where(eq(schema.parts.id, data.id)).get()
    if (!existing) {
      throw new Error(`Part ${data.id} not found`)
    }
    persistPart(data.id, data)
    const detail = loadPartDetail(data.id)
    if (!detail) throw new Error('Failed to load updated part')
    return detail
  })

  ipcMain.handle(IpcChannels.PARTS_DELETE, async (_event, raw: unknown) => {
    const { id } = PartIdSchema.parse(typeof raw === 'number' ? { id: raw } : raw)
    const photos = collectPartPhotoPaths(id)
    getDb().delete(schema.parts).where(eq(schema.parts.id, id)).run()
    for (const path of photos) {
      deleteImageFile(path)
    }
    return { success: true }
  })

  ipcMain.handle(
    IpcChannels.PARTS_PICK_FIXTURE_PHOTO,
    async (event): Promise<PhotoResult> => {
      const win = BrowserWindow.fromWebContents(event.sender)
      return pickAndSaveImage(win, {
        title: 'Вибрати фото приспособи',
        subdir: 'fixtures'
      })
    }
  )

  ipcMain.handle(
    IpcChannels.PARTS_PICK_TRANSITION_PHOTO,
    async (event): Promise<PhotoResult> => {
      const win = BrowserWindow.fromWebContents(event.sender)
      return pickAndSaveImage(win, {
        title: 'Вибрати фото переходу',
        subdir: 'transitions'
      })
    }
  )
}

function persistPart(existingId: number | null, data: PartCreate): number {
  const db = getDb()
  const now = new Date().toISOString()

  if (data.machineId != null) {
    const machine = db
      .select({ id: schema.machines.id })
      .from(schema.machines)
      .where(eq(schema.machines.id, data.machineId))
      .get()
    if (!machine) {
      throw new Error(`Machine ${data.machineId} not found`)
    }
  }

  const oldPhotos = existingId != null ? collectPartPhotoPaths(existingId) : []

  const partId = db.transaction((tx) => {
    let id: number

    if (existingId == null) {
      const inserted = tx
        .insert(schema.parts)
        .values({
          code: data.code,
          name: data.name,
          material: data.material ?? '',
          workpieceType: data.workpieceType ?? '',
          machineId: data.machineId ?? null,
          notes: data.notes ?? '',
          createdAt: now,
          updatedAt: now
        })
        .returning({ id: schema.parts.id })
        .get()
      id = inserted.id
    } else {
      tx.update(schema.parts)
        .set({
          code: data.code,
          name: data.name,
          material: data.material ?? '',
          workpieceType: data.workpieceType ?? '',
          machineId: data.machineId ?? null,
          notes: data.notes ?? '',
          updatedAt: now
        })
        .where(eq(schema.parts.id, existingId))
        .run()

      // Cascade deletes fixture photos via FK
      tx.delete(schema.partPrograms).where(eq(schema.partPrograms.partId, existingId)).run()
      tx.delete(schema.partFixtures).where(eq(schema.partFixtures.partId, existingId)).run()
      tx.delete(schema.partTransitions).where(eq(schema.partTransitions.partId, existingId)).run()
      id = existingId
    }

    if (data.machineId != null && data.program) {
      tx.insert(schema.partPrograms)
        .values({
          partId: id,
          name: data.program.name ?? '',
          programNumber: data.program.programNumber ?? '',
          notes: data.program.notes ?? '',
          createdAt: now,
          updatedAt: now
        })
        .run()
    }

    ;(data.fixtures ?? []).forEach((fixture, index) => {
      const inserted = tx
        .insert(schema.partFixtures)
        .values({
          partId: id,
          name: fixture.name,
          description: fixture.description ?? '',
          notes: fixture.notes ?? '',
          sortOrder: index,
          createdAt: now,
          updatedAt: now
        })
        .returning({ id: schema.partFixtures.id })
        .get()

      ;(fixture.photoPaths ?? []).forEach((photoPath, photoIndex) => {
        tx.insert(schema.partFixturePhotos)
          .values({
            fixtureId: inserted.id,
            photoPath,
            sortOrder: photoIndex
          })
          .run()
      })
    })

    ;(data.transitions ?? []).forEach((step, index) => {
      const tool = step.toolAssembly ?? {}
      tx.insert(schema.partTransitions)
        .values({
          partId: id,
          stepNumber: step.stepNumber,
          name: step.name,
          description: step.description ?? '',
          toolName: tool.name ?? '',
          toolDiameter: tool.diameter ?? '',
          toolLength: tool.length ?? '',
          toolNotes: tool.notes ?? '',
          photoPath: step.photoPath ?? null,
          sortOrder: step.sortOrder ?? index,
          createdAt: now,
          updatedAt: now
        })
        .run()
    })

    return id
  })
  const keptPhotos = new Set(collectPartPhotoPaths(partId))
  for (const path of oldPhotos) {
    if (!keptPhotos.has(path)) {
      deleteImageFile(path)
    }
  }

  logger.info(existingId == null ? 'Part created:' : 'Part updated:', partId)
  return partId
}

function loadPartDetail(id: number): PartDetail | null {
  const db = getDb()
  const row = db
    .select({
      id: schema.parts.id,
      code: schema.parts.code,
      name: schema.parts.name,
      material: schema.parts.material,
      workpieceType: schema.parts.workpieceType,
      machineId: schema.parts.machineId,
      machineName: schema.machines.name,
      notes: schema.parts.notes,
      createdAt: schema.parts.createdAt,
      updatedAt: schema.parts.updatedAt
    })
    .from(schema.parts)
    .leftJoin(schema.machines, eq(schema.parts.machineId, schema.machines.id))
    .where(eq(schema.parts.id, id))
    .get()

  if (!row) return null

  const programRow = db
    .select()
    .from(schema.partPrograms)
    .where(eq(schema.partPrograms.partId, id))
    .get()

  const program: PartProgram | null = programRow
    ? {
        id: programRow.id,
        name: programRow.name,
        programNumber: programRow.programNumber,
        notes: programRow.notes
      }
    : null

  const fixtureRows = db
    .select()
    .from(schema.partFixtures)
    .where(eq(schema.partFixtures.partId, id))
    .orderBy(asc(schema.partFixtures.sortOrder), asc(schema.partFixtures.id))
    .all()

  const fixtures: PartFixture[] = fixtureRows.map((fixture) => {
    const photos = db
      .select()
      .from(schema.partFixturePhotos)
      .where(eq(schema.partFixturePhotos.fixtureId, fixture.id))
      .orderBy(asc(schema.partFixturePhotos.sortOrder), asc(schema.partFixturePhotos.id))
      .all()

    return {
      id: fixture.id,
      name: fixture.name,
      description: fixture.description,
      notes: fixture.notes,
      sortOrder: fixture.sortOrder,
      photoPaths: photos.map((p) => p.photoPath)
    }
  })

  const transitionRows = db
    .select()
    .from(schema.partTransitions)
    .where(eq(schema.partTransitions.partId, id))
    .orderBy(asc(schema.partTransitions.sortOrder), asc(schema.partTransitions.stepNumber))
    .all()

  const transitions: PartTransition[] = transitionRows.map((step) => ({
    id: step.id,
    stepNumber: step.stepNumber,
    name: step.name,
    description: step.description,
    toolAssembly: {
      name: step.toolName,
      diameter: step.toolDiameter,
      length: step.toolLength,
      notes: step.toolNotes
    },
    photoPath: step.photoPath,
    sortOrder: step.sortOrder
  }))

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    material: row.material,
    workpieceType: row.workpieceType,
    machineId: row.machineId,
    machineName: row.machineName ?? null,
    notes: row.notes,
    program,
    fixtures,
    transitions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

function collectPartPhotoPaths(partId: number): string[] {
  const db = getDb()
  const paths: string[] = []

  const fixtures = db
    .select({ id: schema.partFixtures.id })
    .from(schema.partFixtures)
    .where(eq(schema.partFixtures.partId, partId))
    .all()

  for (const fixture of fixtures) {
    const photos = db
      .select({ photoPath: schema.partFixturePhotos.photoPath })
      .from(schema.partFixturePhotos)
      .where(eq(schema.partFixturePhotos.fixtureId, fixture.id))
      .all()
    for (const photo of photos) {
      paths.push(photo.photoPath)
    }
  }

  const transitions = db
    .select({ photoPath: schema.partTransitions.photoPath })
    .from(schema.partTransitions)
    .where(eq(schema.partTransitions.partId, partId))
    .all()

  for (const step of transitions) {
    if (step.photoPath) paths.push(step.photoPath)
  }

  return paths
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '')
}
