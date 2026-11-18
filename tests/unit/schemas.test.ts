import { describe, expect, it } from 'vitest'
import {
  HexColorSchema,
  MaterialCategorySchema,
  MaterialCreateSchema,
  PartCreateSchema,
  PartSearchSchema,
  SettingsSchema
} from '../../src/shared/schemas'

describe('SettingsSchema', () => {
  it('applies defaults', () => {
    const parsed = SettingsSchema.parse({})
    expect(parsed.theme).toBe('system')
    expect(parsed.language).toBe('uk')
    expect(parsed.autoBackup).toBe(false)
  })
})

describe('MaterialCategorySchema', () => {
  it('accepts ISO 513 letters', () => {
    for (const c of ['P', 'M', 'K', 'N', 'S', 'H'] as const) {
      expect(MaterialCategorySchema.parse(c)).toBe(c)
    }
  })

  it('rejects legacy / invalid categories', () => {
    expect(() => MaterialCategorySchema.parse('steel')).toThrow()
    expect(() => MaterialCategorySchema.parse('other')).toThrow()
  })
})

describe('MaterialCreateSchema', () => {
  it('requires name and valid color', () => {
    const ok = MaterialCreateSchema.parse({
      name: 'Сталь 45',
      category: 'P',
      color: '#1E5AA8'
    })
    expect(ok.name).toBe('Сталь 45')
    expect(ok.category).toBe('P')
  })

  it('rejects bad hex color', () => {
    expect(() =>
      MaterialCreateSchema.parse({
        name: 'X',
        category: 'P',
        color: 'blue'
      })
    ).toThrow()
  })

  it('accepts short hex via HexColorSchema', () => {
    expect(HexColorSchema.parse('#fff')).toBe('#fff')
  })
})

describe('PartCreateSchema', () => {
  it('defaults optional refs and photos', () => {
    const parsed = PartCreateSchema.parse({ code: 'A-1', name: 'Корпус' })
    expect(parsed.materialId).toBeNull()
    expect(parsed.workpieceTypeId).toBeNull()
    expect(parsed.photoPaths).toEqual([])
  })

  it('rejects empty code', () => {
    expect(() => PartCreateSchema.parse({ code: '', name: 'X' })).toThrow()
  })
})

describe('PartSearchSchema', () => {
  it('defaults empty query', () => {
    expect(PartSearchSchema.parse({}).query).toBe('')
  })
})
