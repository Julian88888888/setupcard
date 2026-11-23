import { describe, expect, it } from 'vitest'
import {
  AppPathsSchema,
  BackupResultSchema,
  HexColorSchema,
  MachineCreateSchema,
  MachineSearchSchema,
  MachineUpdateSchema,
  MaterialCategorySchema,
  MaterialCreateSchema,
  MaterialUpdateSchema,
  PartCreateSchema,
  PartListItemSchema,
  PartSearchSchema,
  PartUpdateSchema,
  PhotoResultSchema,
  SettingsSchema,
  SettingsUpdateSchema,
  WorkpieceTypeCreateSchema
} from '../../src/shared/schemas'

describe('SettingsSchema', () => {
  it('applies defaults', () => {
    const parsed = SettingsSchema.parse({})
    expect(parsed.theme).toBe('system')
    expect(parsed.language).toBe('uk')
    expect(parsed.autoBackup).toBe(false)
  })

  it('accepts partial updates', () => {
    const update = SettingsUpdateSchema.parse({ theme: 'dark' })
    expect(update.theme).toBe('dark')
    expect(update.language).toBeUndefined()
  })

  it('rejects invalid theme', () => {
    expect(() => SettingsSchema.parse({ theme: 'neon' })).toThrow()
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

  it('requires id on update', () => {
    expect(() => MaterialUpdateSchema.parse({ name: 'X' })).toThrow()
    expect(MaterialUpdateSchema.parse({ id: 1, name: 'X' }).id).toBe(1)
  })
})

describe('WorkpieceTypeCreateSchema', () => {
  it('requires name and defaults notes', () => {
    const parsed = WorkpieceTypeCreateSchema.parse({ name: 'Пруток' })
    expect(parsed.name).toBe('Пруток')
    expect(parsed.notes).toBe('')
  })

  it('rejects empty name', () => {
    expect(() => WorkpieceTypeCreateSchema.parse({ name: '' })).toThrow()
  })
})

describe('MachineCreateSchema', () => {
  it('requires name and inventory number', () => {
    const parsed = MachineCreateSchema.parse({
      name: 'VF-2',
      inventoryNumber: 'INV-1'
    })
    expect(parsed.name).toBe('VF-2')
    expect(parsed.inventoryNumber).toBe('INV-1')
    expect(parsed.photoPath).toBeNull()
    expect(parsed.notes).toBe('')
  })

  it('rejects negative spindle speed', () => {
    expect(() =>
      MachineCreateSchema.parse({
        name: 'X',
        inventoryNumber: '1',
        maxSpindleSpeed: -1
      })
    ).toThrow()
  })

  it('requires id on update', () => {
    const parsed = MachineUpdateSchema.parse({ id: 5, name: 'Updated' })
    expect(parsed.id).toBe(5)
    expect(parsed.name).toBe('Updated')
  })
})

describe('MachineSearchSchema', () => {
  it('defaults empty query', () => {
    expect(MachineSearchSchema.parse({}).query).toBe('')
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

  it('accepts multiple photo paths', () => {
    const parsed = PartCreateSchema.parse({
      code: 'B-2',
      name: 'Кришка',
      photoPaths: ['parts/a.jpg', 'parts/b.png']
    })
    expect(parsed.photoPaths).toHaveLength(2)
  })

  it('requires id on update', () => {
    const parsed = PartUpdateSchema.parse({
      id: 9,
      code: 'C-3',
      name: 'Вал'
    })
    expect(parsed.id).toBe(9)
  })
})

describe('PartSearchSchema', () => {
  it('defaults empty query', () => {
    expect(PartSearchSchema.parse({}).query).toBe('')
  })
})

describe('PartListItemSchema', () => {
  it('accepts a flat list item with nullable material', () => {
    const item = PartListItemSchema.parse({
      id: 1,
      code: 'A-1',
      name: 'Корпус',
      materialId: null,
      materialName: null,
      materialCategory: null,
      materialColor: null,
      workpieceTypeId: null,
      workpieceTypeName: null,
      notes: '',
      photoPaths: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })
    expect(item.id).toBe(1)
    expect(item.photoPaths).toEqual([])
  })
})

describe('PhotoResultSchema / BackupResultSchema / AppPathsSchema', () => {
  it('accepts successful photo result', () => {
    const ok = PhotoResultSchema.parse({
      success: true,
      path: 'machines/a.jpg',
      paths: ['machines/a.jpg']
    })
    expect(ok.success).toBe(true)
  })

  it('accepts backup failure', () => {
    const fail = BackupResultSchema.parse({ success: false, error: 'cancelled' })
    expect(fail.error).toBe('cancelled')
  })

  it('requires path fields for app paths', () => {
    const paths = AppPathsSchema.parse({
      userData: 'C:/data',
      images: 'C:/data/images',
      database: 'postgresql://***@127.0.0.1:5432/setupcard'
    })
    expect(paths.images).toContain('images')
  })
})
