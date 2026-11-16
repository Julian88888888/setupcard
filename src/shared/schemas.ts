import { z } from 'zod'

/** App settings stored as key/value rows */
export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().min(2).max(10).default('uk'),
  autoBackup: z.boolean().default(false)
})

export type Settings = z.infer<typeof SettingsSchema>

export const SettingsUpdateSchema = SettingsSchema.partial()
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>

/** Example entity — extend or replace as the app grows */
export const ItemCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  /** Relative path under userData/images/, e.g. "photo-abc.jpg" */
  imagePath: z.string().min(1).max(500).nullable().optional().default(null)
})

export type ItemCreate = z.infer<typeof ItemCreateSchema>

export const ItemUpdateSchema = ItemCreateSchema.partial().extend({
  id: z.number().int().positive()
})

export type ItemUpdate = z.infer<typeof ItemUpdateSchema>

export const ItemIdSchema = z.object({
  id: z.number().int().positive()
})

export const ItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  imagePath: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Item = z.infer<typeof ItemSchema>

/** Optional non-negative integer (null clears the field) */
const optionalInt = z.number().int().nonnegative().nullable().optional()

/** Optional non-negative number (null clears the field) */
const optionalNumber = z.number().nonnegative().nullable().optional()

const optionalText = z.string().max(500).optional().default('')
const optionalNotes = z.string().max(5000).optional().default('')

/** Machine create payload */
export const MachineCreateSchema = z.object({
  name: z.string().min(1).max(200),
  inventoryNumber: z.string().min(1).max(100),
  machineType: z.string().max(2000).optional().default(''),
  controlSystemType: optionalText,
  spindleTaper: optionalText,
  maxSpindleSpeed: optionalInt,
  magazineCapacity: optionalInt,
  /** e.g. "630/(700)" */
  maxToolLength: z.string().max(100).optional().default(''),
  /** e.g. "125/(320)" */
  maxToolDiameter: z.string().max(100).optional().default(''),
  maxToolWeight: optionalNumber,
  tableSize: optionalText,
  axisTravel: optionalText,
  tableLoadCapacity: optionalNumber,
  maxWorkpieceSize: optionalText,
  numberOfTables: optionalInt,
  /** Relative path under userData/images/, e.g. "machines/photo.jpg" */
  photoPath: z.string().min(1).max(500).nullable().optional().default(null),
  notes: optionalNotes
})

export type MachineCreate = z.infer<typeof MachineCreateSchema>

export const MachineUpdateSchema = MachineCreateSchema.partial().extend({
  id: z.number().int().positive()
})

export type MachineUpdate = z.infer<typeof MachineUpdateSchema>

export const MachineIdSchema = z.object({
  id: z.number().int().positive()
})

export const MachineSearchSchema = z.object({
  query: z.string().max(200).optional().default('')
})

export type MachineSearch = z.infer<typeof MachineSearchSchema>

export const MachineSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  inventoryNumber: z.string(),
  machineType: z.string(),
  controlSystemType: z.string(),
  spindleTaper: z.string(),
  maxSpindleSpeed: z.number().int().nullable(),
  magazineCapacity: z.number().int().nullable(),
  maxToolLength: z.string(),
  maxToolDiameter: z.string(),
  maxToolWeight: z.number().nullable(),
  tableSize: z.string(),
  axisTravel: z.string(),
  tableLoadCapacity: z.number().nullable(),
  maxWorkpieceSize: z.string(),
  numberOfTables: z.number().int().nullable(),
  photoPath: z.string().nullable(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Machine = z.infer<typeof MachineSchema>

/** Result of picking / saving a machine photo via dialog */
export const MachinePhotoResultSchema = z.object({
  success: z.boolean(),
  /** Relative path under images/, e.g. "machines/abc.jpg" */
  path: z.string().optional(),
  error: z.string().optional()
})

export type MachinePhotoResult = z.infer<typeof MachinePhotoResultSchema>

/** Shared photo picker result (machines / fixtures / transitions) */
export const PhotoResultSchema = MachinePhotoResultSchema
export type PhotoResult = MachinePhotoResult

// ── Parts (Деталі) ──────────────────────────────────────────────────────────

export const PartProgramInputSchema = z.object({
  name: z.string().max(200).optional().default(''),
  programNumber: z.string().max(100).optional().default(''),
  notes: optionalNotes
})

export type PartProgramInput = z.infer<typeof PartProgramInputSchema>

export const PartProgramSchema = PartProgramInputSchema.extend({
  id: z.number().int().positive()
})

export type PartProgram = z.infer<typeof PartProgramSchema>

export const PartFixtureInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  notes: optionalNotes,
  /** Relative paths under images/fixtures/ */
  photoPaths: z.array(z.string().min(1).max(500)).default([])
})

export type PartFixtureInput = z.infer<typeof PartFixtureInputSchema>

export const PartFixtureSchema = PartFixtureInputSchema.extend({
  id: z.number().int().positive(),
  sortOrder: z.number().int().nonnegative()
})

export type PartFixture = z.infer<typeof PartFixtureSchema>

export const ToolAssemblySchema = z.object({
  name: z.string().max(200).optional().default(''),
  diameter: z.string().max(100).optional().default(''),
  length: z.string().max(100).optional().default(''),
  notes: z.string().max(2000).optional().default('')
})

export type ToolAssembly = z.infer<typeof ToolAssemblySchema>

export const PartTransitionInputSchema = z.object({
  stepNumber: z.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(''),
  toolAssembly: ToolAssemblySchema.optional().default({}),
  photoPath: z.string().min(1).max(500).nullable().optional().default(null),
  sortOrder: z.number().int().nonnegative().optional().default(0)
})

export type PartTransitionInput = z.infer<typeof PartTransitionInputSchema>

export const PartTransitionSchema = PartTransitionInputSchema.extend({
  id: z.number().int().positive()
})

export type PartTransition = z.infer<typeof PartTransitionSchema>

export const PartCreateSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  material: z.string().max(200).optional().default(''),
  workpieceType: z.string().max(200).optional().default(''),
  machineId: z.number().int().positive().nullable().optional().default(null),
  notes: optionalNotes,
  /** Present only when a machine is selected */
  program: PartProgramInputSchema.nullable().optional().default(null),
  fixtures: z.array(PartFixtureInputSchema).optional().default([]),
  transitions: z.array(PartTransitionInputSchema).optional().default([])
})

export type PartCreate = z.infer<typeof PartCreateSchema>

export const PartUpdateSchema = PartCreateSchema.extend({
  id: z.number().int().positive()
})

export type PartUpdate = z.infer<typeof PartUpdateSchema>

export const PartIdSchema = z.object({
  id: z.number().int().positive()
})

export const PartSearchSchema = z.object({
  query: z.string().max(200).optional().default('')
})

export type PartSearch = z.infer<typeof PartSearchSchema>

export const PartListItemSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  material: z.string(),
  workpieceType: z.string(),
  machineId: z.number().int().positive().nullable(),
  machineName: z.string().nullable(),
  notes: z.string(),
  fixtureCount: z.number().int().nonnegative(),
  transitionCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type PartListItem = z.infer<typeof PartListItemSchema>

export const PartDetailSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  material: z.string(),
  workpieceType: z.string(),
  machineId: z.number().int().positive().nullable(),
  machineName: z.string().nullable(),
  notes: z.string(),
  program: PartProgramSchema.nullable(),
  fixtures: z.array(PartFixtureSchema),
  transitions: z.array(PartTransitionSchema),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type PartDetail = z.infer<typeof PartDetailSchema>

/** Backup dialog result */
export const BackupResultSchema = z.object({
  success: z.boolean(),
  path: z.string().optional(),
  error: z.string().optional()
})

export type BackupResult = z.infer<typeof BackupResultSchema>

export const AppPathsSchema = z.object({
  userData: z.string(),
  images: z.string(),
  database: z.string()
})

export type AppPaths = z.infer<typeof AppPathsSchema>
