import { describe, expect, it } from 'vitest'
import { WORKPIECE_TYPE_SEED } from '../../src/main/db/seed-catalogs'

describe('WORKPIECE_TYPE_SEED', () => {
  it('has unique non-empty names', () => {
    expect(WORKPIECE_TYPE_SEED.length).toBeGreaterThan(0)
    for (const name of WORKPIECE_TYPE_SEED) {
      expect(name.trim().length).toBeGreaterThan(0)
    }
    expect(new Set(WORKPIECE_TYPE_SEED).size).toBe(WORKPIECE_TYPE_SEED.length)
  })

  it('includes common shop workpiece forms', () => {
    for (const name of ['Пруток', 'Лист', 'Плита', 'Труба']) {
      expect(WORKPIECE_TYPE_SEED).toContain(name)
    }
  })
})
