import { describe, expect, it } from 'vitest'
import { HELP_SECTIONS, type HelpBlock } from '../../src/renderer/src/components/help/content'
import { MATERIAL_CATEGORIES } from '../../src/renderer/src/components/catalogs/labels'

describe('HELP_SECTIONS', () => {
  it('has unique section ids', () => {
    const ids = HELP_SECTIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes core reference sections', () => {
    const ids = new Set(HELP_SECTIONS.map((s) => s.id))
    for (const id of ['iso', 'materials', 'parts', 'machines', 'photos', 'backup']) {
      expect(ids.has(id)).toBe(true)
    }
  })

  it('every section has a title and at least one block', () => {
    for (const section of HELP_SECTIONS) {
      expect(section.title.trim().length).toBeGreaterThan(0)
      expect(section.blocks.length).toBeGreaterThan(0)
    }
  })

  it('ISO table lists all six material groups', () => {
    const iso = HELP_SECTIONS.find((s) => s.id === 'iso')
    expect(iso).toBeTruthy()
    const table = iso!.blocks.find(
      (b): b is Extract<HelpBlock, { type: 'table' }> => b.type === 'table'
    )
    expect(table).toBeTruthy()
    const codes = table!.rows.map((row) => row[0])
    expect(codes).toEqual([...MATERIAL_CATEGORIES])
  })

  it('block payloads are non-empty', () => {
    for (const section of HELP_SECTIONS) {
      for (const block of section.blocks) {
        if (block.type === 'paragraph' || block.type === 'note') {
          expect(block.text.trim().length).toBeGreaterThan(0)
        } else if (block.type === 'bullets') {
          expect(block.items.length).toBeGreaterThan(0)
        } else {
          expect(block.headers.length).toBeGreaterThan(0)
          expect(block.rows.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
