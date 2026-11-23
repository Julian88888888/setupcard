import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../src/main/db/schema'

loadEnv({ path: resolve(process.cwd(), '.env') })

const DATABASE_URL =
  process.env.DATABASE_URL?.trim() ||
  'postgresql://setupcard:setupcard@127.0.0.1:5432/setupcard'

const suffix = `test-${Date.now()}`
const machineName = `Vitest Machine ${suffix}`
const inventoryNumber = `INV-${suffix}`
const workpieceName = `Vitest Workpiece ${suffix}`
const settingsKey = `vitest.theme.${suffix}`

let pool: Pool
let db: NodePgDatabase<typeof schema>
let available = false
let machineId: number | null = null
let workpieceId: number | null = null

async function canConnect(): Promise<boolean> {
  const probe = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 })
  try {
    await probe.query('SELECT 1')
    await probe.query('SELECT 1 FROM machines LIMIT 1')
    await probe.query('SELECT 1 FROM workpiece_types LIMIT 1')
    await probe.query('SELECT 1 FROM settings LIMIT 1')
    await probe.end()
    return true
  } catch {
    try {
      await probe.end()
    } catch {
      // ignore
    }
    return false
  }
}

beforeAll(async () => {
  available = await canConnect()
  if (!available) return
  pool = new Pool({ connectionString: DATABASE_URL })
  db = drizzle(pool, { schema })
})

afterAll(async () => {
  if (!available) return
  try {
    if (machineId != null) {
      await db.delete(schema.machines).where(eq(schema.machines.id, machineId))
    }
    if (workpieceId != null) {
      await db.delete(schema.workpieceTypes).where(eq(schema.workpieceTypes.id, workpieceId))
    }
    await db.delete(schema.settings).where(eq(schema.settings.key, settingsKey))
  } finally {
    await pool.end()
  }
})

describe('Postgres machines / workpiece types / settings integration', () => {
  it('connects to PostgreSQL (skip if Docker is down)', async ({ skip }) => {
    if (!available) {
      skip()
      return
    }
    const result = await pool.query('SELECT 1 AS ok')
    expect(result.rows[0].ok).toBe(1)
  })

  it('creates a machine', async ({ skip }) => {
    if (!available) {
      skip()
      return
    }
    const now = new Date().toISOString()
    const [row] = await db
      .insert(schema.machines)
      .values({
        name: machineName,
        inventoryNumber,
        machineType: 'vertical',
        controlSystemType: 'Fanuc',
        spindleTaper: 'BT40',
        maxSpindleSpeed: 8000,
        magazineCapacity: 24,
        maxToolLength: '300',
        maxToolDiameter: '80',
        maxToolWeight: 8,
        tableSize: '1000x500',
        axisTravel: 'X800 Y500 Z500',
        tableLoadCapacity: 500,
        maxWorkpieceSize: '600x400x300',
        numberOfTables: 1,
        photoPath: null,
        notes: 'vitest',
        createdAt: now,
        updatedAt: now
      })
      .returning()
    machineId = row.id
    expect(row.inventoryNumber).toBe(inventoryNumber)
    expect(row.maxSpindleSpeed).toBe(8000)
  })

  it('creates a unique workpiece type', async ({ skip }) => {
    if (!available) {
      skip()
      return
    }
    const now = new Date().toISOString()
    const [row] = await db
      .insert(schema.workpieceTypes)
      .values({
        name: workpieceName,
        notes: 'vitest',
        createdAt: now,
        updatedAt: now
      })
      .returning()
    workpieceId = row.id
    expect(row.name).toBe(workpieceName)

    await expect(
      db.insert(schema.workpieceTypes).values({
        name: workpieceName,
        notes: '',
        createdAt: now,
        updatedAt: now
      })
    ).rejects.toThrow()
  })

  it('upserts a settings key/value row', async ({ skip }) => {
    if (!available) {
      skip()
      return
    }
    await db.insert(schema.settings).values({
      key: settingsKey,
      value: JSON.stringify('dark')
    })

    await db
      .insert(schema.settings)
      .values({
        key: settingsKey,
        value: JSON.stringify('light')
      })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: JSON.stringify('light') }
      })

    const rows = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, settingsKey))
      .limit(1)
    expect(JSON.parse(rows[0].value)).toBe('light')
  })
})
