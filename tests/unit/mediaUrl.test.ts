import { describe, expect, it } from 'vitest'
import { mediaUrl } from '../../src/renderer/src/lib/media'

describe('mediaUrl', () => {
  it('builds media:// URL from relative path', () => {
    expect(mediaUrl('machines/abc.jpg')).toBe('media://local/machines/abc.jpg')
    expect(mediaUrl('parts/x.png')).toBe('media://local/parts/x.png')
  })

  it('normalizes slashes', () => {
    expect(mediaUrl('\\machines\\abc.jpg')).toBe('media://local/machines/abc.jpg')
    expect(mediaUrl('/parts/a.jpg')).toBe('media://local/parts/a.jpg')
  })

  it('returns null for empty values', () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl(undefined)).toBeNull()
    expect(mediaUrl('')).toBeNull()
    expect(mediaUrl('/')).toBeNull()
  })
})
