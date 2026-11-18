import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { count, eq } from 'drizzle-orm'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../src/main/db/schema'

loadEnv({ path: resolve(process.cwd(), '.env') })

const DATABASE_URL =
  process.env.DATABASE_URL?.trim() ||
  'postgresql://setupcard:setupcard@127.0.0.1:5432/setupcard'

const suffix = `test-${Date.now()}`
const materialName = `Vitest Material ${suffix}`
const partCode = `VT-${suffix}`

let pool: Pool
let db: NodePgDatabase<typeof schema>
let available = false
let materialId: number | null = null
let partId: number | null = null

async function canConnect(): Promise<boolean> {
  const probe = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 })
  try {
    await probe.query('SELECT 1')
    await probe.query('SELECT 1 FROM materials LIMIT 1')
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
    if (partId != null) {
      await db.delete(schema.parts).where(eq(schema.parts.id, partId))
    }
    if (materialId != null) {
      await db.delete(schema.materials).where(eq(schema.materials.id, materialId))
    }
  } finally {
    await pool.end()
  }
})

describe('Postgres materials / parts integration', () => {
  it('connects to PostgreSQL (skip if Docker is down)', async ({ skip }) => {
    if (!available) {
      skip()
      return
    }
    const result = await pool.query('SELECT current_database() AS db')
    expect(result.rows[0].db).toBe('setupcard')
  })

  it('creates a material with ISO category', async ({ skip }) => {
    if (!available) {
      skip()
      return
    }
    const now = new Date().toISOString()
    const [row] = await db
      .insert(schema.materials)
      .values({
        name: materialName,
        category: 'P',
        color: '#1E5AA8',
        notes: 'vitest',
        createdAt: now,
        updatedAt: now
      })
      .returning()
    materialId = row.id
    expect(row.category).toBe('P')
    expect(row.name).toBe(materialName)
  })

  it('rejects duplicate material names', async ({ skip }) => {
    if (!available || materialId == null) {
      skip()
      return
    }
    const now = new Date().toISOString()
    await expect(
      db.insert(schema.materials).values({
        name: materialName,
        category: 'M',
        color: '#E8B923',
        notes: '',
        createdAt: now,
        updatedAt: now
      })
    ).rejects.toThrow()
  })

  it('creates a part linked to the material', async ({ skip }) => {
    if (!available || materialId == null) {
      skip()
      return
    }
    const now = new Date().toISOString()
    const [part] = await db
      .insert(schema.parts)
      .values({
        code: partCode,
        name: 'Vitest Part',
        materialId,
        workpieceTypeId: null,
        notes: '',
        createdAt: now,
        updatedAt: now
      })
      .returning()
    partId = part.id

    await db.insert(schema.partPhotos).values({
      partId: part.id,
      photoPath: `parts/${suffix}.jpg`,
      sortOrder: 0
    })

    const joined = await db
      .select({
        code: schema.parts.code,
        materialName: schema.materials.name,
        materialCategory: schema.materials.category
      })
      .from(schema.parts)
      .leftJoin(schema.materials, eq(schema.parts.materialId, schema.materials.id))
      .where(eq(schema.parts.id, part.id))
      .limit(1)

    expect(joined[0].code).toBe(partCode)
    expect(joined[0].materialName).toBe(materialName)
    expect(joined[0].materialCategory).toBe('P')
  })

  it('blocks deleting material that is in use (usage count)', async ({ skip }) => {
    if (!available || materialId == null) {
      skip()
      return
    }
    const [{ value }] = await db
      .select({ value: count() })
      .from(schema.parts)
      .where(eq(schema.parts.materialId, materialId))
    expect(value).toBeGreaterThan(0)
  })

  it('cascades part photo delete when part is removed', async ({ skip }) => {
    if (!available || partId == null) {
      skip()
      return
    }
    const id = partId
    await db.delete(schema.parts).where(eq(schema.parts.id, id))
    partId = null

    const photos = await db
      .select()
      .from(schema.partPhotos)
      .where(eq(schema.partPhotos.partId, id))
    expect(photos).toHaveLength(0)
  })
})
