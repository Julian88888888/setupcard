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

/** Result of picking / saving a photo via dialog */
export const PhotoResultSchema = z.object({
  success: z.boolean(),
  /** First relative path (compat with single-photo callers) */
  path: z.string().optional(),
  /** All saved relative paths when multi-select is used */
  paths: z.array(z.string()).optional(),
  error: z.string().optional()
})

export type PhotoResult = z.infer<typeof PhotoResultSchema>

/** @deprecated alias — prefer PhotoResult */
export const MachinePhotoResultSchema = PhotoResultSchema
export type MachinePhotoResult = PhotoResult

// ── Material / Workpiece catalogs ───────────────────────────────────────────

/**
 * ISO 513 material application groups (as on cutting-insert packaging).
 * Used for UI color coding and future tool↔material compatibility.
 */
export const MaterialCategorySchema = z.enum(['P', 'M', 'K', 'N', 'S', 'H'])

export type MaterialCategory = z.infer<typeof MaterialCategorySchema>

/** Hex color like #RRGGBB or #RGB */
export const HexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, 'Очікується колір у форматі #RRGGBB')
  .default('#1E5AA8')

export const MaterialCreateSchema = z.object({
  name: z.string().min(1).max(200),
  category: MaterialCategorySchema.default('P'),
  color: HexColorSchema,
  notes: optionalNotes
})

export type MaterialCreate = z.infer<typeof MaterialCreateSchema>

export const MaterialUpdateSchema = MaterialCreateSchema.partial().extend({
  id: z.number().int().positive()
})

export type MaterialUpdate = z.infer<typeof MaterialUpdateSchema>

export const MaterialIdSchema = z.object({
  id: z.number().int().positive()
})

export const MaterialSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  category: MaterialCategorySchema,
  color: z.string(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Material = z.infer<typeof MaterialSchema>

export const WorkpieceTypeCreateSchema = z.object({
  name: z.string().min(1).max(200),
  notes: optionalNotes
})

export type WorkpieceTypeCreate = z.infer<typeof WorkpieceTypeCreateSchema>

export const WorkpieceTypeUpdateSchema = WorkpieceTypeCreateSchema.partial().extend({
  id: z.number().int().positive()
})

export type WorkpieceTypeUpdate = z.infer<typeof WorkpieceTypeUpdateSchema>

export const WorkpieceTypeIdSchema = z.object({
  id: z.number().int().positive()
})

export const WorkpieceTypeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type WorkpieceType = z.infer<typeof WorkpieceTypeSchema>

// ── Parts (Деталі) — flat card ───────────────────────────────────────────────

export const PartCreateSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  materialId: z.number().int().positive().nullable().optional().default(null),
  workpieceTypeId: z.number().int().positive().nullable().optional().default(null),
  notes: optionalNotes,
  /** Relative paths under images/parts/ */
  photoPaths: z.array(z.string().min(1).max(500)).optional().default([])
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
  materialId: z.number().int().positive().nullable(),
  materialName: z.string().nullable(),
  materialCategory: MaterialCategorySchema.nullable(),
  materialColor: z.string().nullable(),
  workpieceTypeId: z.number().int().positive().nullable(),
  workpieceTypeName: z.string().nullable(),
  notes: z.string(),
  /** All photo paths; first is used as list thumbnail */
  photoPaths: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type PartListItem = z.infer<typeof PartListItemSchema>

/** Detail is the same flat shape as list item for the simplified part */
export const PartDetailSchema = PartListItemSchema
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
