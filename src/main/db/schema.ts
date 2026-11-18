import { integer, pgTable, real, serial, text } from 'drizzle-orm/pg-core'

/**
 * Drizzle schema — source of truth for the PostgreSQL database.
 * Run `npm run db:generate` after changing this file to create a new migration.
 *
 * Stage-2 hook: materials.category is the contract for future tool compatibility rules.
 */

/** Key/value settings store */
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})

/**
 * Example items table.
 * imagePath stores a relative path under userData/images/ (never an absolute path).
 */
export const items = pgTable('items', {
  id: serial('id').primaryKey(),
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

/**
 * CNC / machining equipment registry.
 * photoPath is relative under userData/images/, e.g. "machines/abc.jpg".
 */
export const machines = pgTable('machines', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  inventoryNumber: text('inventory_number').notNull(),
  machineType: text('machine_type').notNull().default(''),
  controlSystemType: text('control_system_type').notNull().default(''),
  spindleTaper: text('spindle_taper').notNull().default(''),
  maxSpindleSpeed: integer('max_spindle_speed'),
  magazineCapacity: integer('magazine_capacity'),
  /** Text so values like "630/(700)" are allowed */
  maxToolLength: text('max_tool_length').notNull().default(''),
  /** Text so values like "125/(320)" are allowed */
  maxToolDiameter: text('max_tool_diameter').notNull().default(''),
  maxToolWeight: real('max_tool_weight'),
  tableSize: text('table_size').notNull().default(''),
  axisTravel: text('axis_travel').notNull().default(''),
  tableLoadCapacity: real('table_load_capacity'),
  maxWorkpieceSize: text('max_workpiece_size').notNull().default(''),
  numberOfTables: integer('number_of_tables'),
  photoPath: text('photo_path'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/**
 * Material catalog — foundation for future tool↔material compatibility.
 * category uses ISO 513 groups (P M K N S H).
 */
export const materials = pgTable('materials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  /** ISO 513 group: P | M | K | N | S | H */
  category: text('category').notNull().default('P'),
  /** Hex color aligned with ISO packaging (P blue, M yellow, …) */
  color: text('color').notNull().default('#1E5AA8'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/** Workpiece type catalog (Пруток, Лист, …). */
export const workpieceTypes = pgTable('workpiece_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/**
 * Parts (Деталі) — flat machining cards.
 * Photos live in part_photos (relative under userData/images/parts/).
 */
export const parts = pgTable('parts', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  materialId: integer('material_id').references(() => materials.id, { onDelete: 'set null' }),
  workpieceTypeId: integer('workpiece_type_id').references(() => workpieceTypes.id, {
    onDelete: 'set null'
  }),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/** Multiple photos per part — relative paths under images/parts/. */
export const partPhotos = pgTable('part_photos', {
  id: serial('id').primaryKey(),
  partId: integer('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  photoPath: text('photo_path').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

export type SettingsRow = typeof settings.$inferSelect
export type ItemRow = typeof items.$inferSelect
export type NewItemRow = typeof items.$inferInsert
export type MachineRow = typeof machines.$inferSelect
export type NewMachineRow = typeof machines.$inferInsert
export type MaterialRow = typeof materials.$inferSelect
export type WorkpieceTypeRow = typeof workpieceTypes.$inferSelect
export type PartRow = typeof parts.$inferSelect
export type NewPartRow = typeof parts.$inferInsert
export type PartPhotoRow = typeof partPhotos.$inferSelect
