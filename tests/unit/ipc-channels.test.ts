import { describe, expect, it } from 'vitest'
import { IpcChannels } from '../../src/shared/ipc-channels'

describe('IpcChannels', () => {
  it('has unique channel string values', () => {
    const values = Object.values(IpcChannels)
    expect(new Set(values).size).toBe(values.length)
  })

  it('uses domain:action naming', () => {
    for (const channel of Object.values(IpcChannels)) {
      expect(channel).toMatch(/^[a-zA-Z]+:[a-zA-Z0-9-]+$/)
    }
  })

  it('includes core domains used by the app', () => {
    const values = Object.values(IpcChannels)
    expect(values).toContain('settings:get')
    expect(values).toContain('machines:list')
    expect(values).toContain('materials:list')
    expect(values).toContain('workpieceTypes:list')
    expect(values).toContain('parts:list')
    expect(values).toContain('backup:export')
    expect(values).toContain('app:get-paths')
  })
})
