import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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

/**
 * CNC / machining equipment registry.
 * photoPath is relative under userData/images/, e.g. "machines/abc.jpg".
 */
export const machines = sqliteTable('machines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
 * Parts (Деталі) — machining cards linked to a machine.
 */
export const parts = sqliteTable('parts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  material: text('material').notNull().default(''),
  workpieceType: text('workpiece_type').notNull().default(''),
  machineId: integer('machine_id').references(() => machines.id, { onDelete: 'set null' }),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/** CNC program for a part (shown after a machine is selected). One per part. */
export const partPrograms = sqliteTable('part_programs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partId: integer('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default(''),
  programNumber: text('program_number').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/** Fixtures / Приспособи — multiple per part. */
export const partFixtures = sqliteTable('part_fixtures', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partId: integer('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  notes: text('notes').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

/** Photos for a fixture — relative paths under images/fixtures/. */
export const partFixturePhotos = sqliteTable('part_fixture_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fixtureId: integer('fixture_id')
    .notNull()
    .references(() => partFixtures.id, { onDelete: 'cascade' }),
  photoPath: text('photo_path').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

/**
 * Processing steps / Переходи.
 * Tool assembly fields are denormalized next to each step.
 */
export const partTransitions = sqliteTable('part_transitions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partId: integer('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull().default(1),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  toolName: text('tool_name').notNull().default(''),
  toolDiameter: text('tool_diameter').notNull().default(''),
  toolLength: text('tool_length').notNull().default(''),
  toolNotes: text('tool_notes').notNull().default(''),
  photoPath: text('photo_path'),
  sortOrder: integer('sort_order').notNull().default(0),
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
export type MachineRow = typeof machines.$inferSelect
export type NewMachineRow = typeof machines.$inferInsert
export type PartRow = typeof parts.$inferSelect
export type NewPartRow = typeof parts.$inferInsert
