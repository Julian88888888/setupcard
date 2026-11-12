import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Drizzle schema — source of truth for the SQLite database.
 * Run `npm run db:generate` after changing this file to create a new migration.
 */

/** Key/value settings store */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})

/**
 * Example items table.
 * imagePath stores a relative path under userData/images/ (never an absolute path).
 */
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  imagePath: text('image_path'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

export type SettingsRow = typeof settings.$inferSelect
export type ItemRow = typeof items.$inferSelect
export type NewItemRow = typeof items.$inferInsert
