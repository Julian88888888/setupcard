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
