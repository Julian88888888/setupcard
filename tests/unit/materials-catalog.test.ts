import { describe, expect, it } from 'vitest'
import { MATERIAL_SEED, ISO_CATEGORY_COLORS } from '../../src/main/db/seed-catalogs'
import {
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_DEFAULT_COLORS,
  MATERIAL_CATEGORY_LABELS,
  materialGroupTitle
} from '../../src/renderer/src/components/catalogs/labels'
import { MaterialCategorySchema } from '../../src/shared/schemas'

describe('ISO labels', () => {
  it('covers all six ISO groups', () => {
    expect(MATERIAL_CATEGORIES).toEqual(['P', 'M', 'K', 'N', 'S', 'H'])
  })

  it('has Ukrainian labels and packaging colors', () => {
    for (const c of MATERIAL_CATEGORIES) {
      expect(MATERIAL_CATEGORY_LABELS[c].length).toBeGreaterThan(0)
      expect(MATERIAL_CATEGORY_DEFAULT_COLORS[c]).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(ISO_CATEGORY_COLORS[c]).toBe(MATERIAL_CATEGORY_DEFAULT_COLORS[c])
      expect(materialGroupTitle(c)).toContain(c)
    }
  })
})

describe('MATERIAL_SEED', () => {
  it('only uses valid ISO categories', () => {
    for (const row of MATERIAL_SEED) {
      expect(MaterialCategorySchema.safeParse(row.category).success).toBe(true)
      expect(row.name.trim().length).toBeGreaterThan(0)
    }
  })

  it('has unique material names', () => {
    const names = MATERIAL_SEED.map((m) => m.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('puts martensitic stainless in P', () => {
    expect(MATERIAL_SEED.find((m) => m.name === '20Х13')?.category).toBe('P')
    expect(MATERIAL_SEED.find((m) => m.name === '40Х13')?.category).toBe('P')
  })

  it('puts austenitic stainless in M', () => {
    expect(MATERIAL_SEED.find((m) => m.name === '12Х18Н10Т')?.category).toBe('M')
  })

  it('puts plastics in N and titanium in S', () => {
    expect(MATERIAL_SEED.find((m) => m.name === 'Капролон')?.category).toBe('N')
    expect(MATERIAL_SEED.find((m) => m.name === 'Титан ВТ6')?.category).toBe('S')
  })

  it('includes hardened H examples', () => {
    const h = MATERIAL_SEED.filter((m) => m.category === 'H')
    expect(h.length).toBeGreaterThan(0)
  })
})
