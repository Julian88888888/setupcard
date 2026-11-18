import { describe, expect, it } from 'vitest'
import { relative, resolve } from 'path'
import { resolveSafeImagePathFromRoot } from '../../src/main/protocol/media-path'

const ROOT = resolve('/tmp/setupcard-images-test')

function isInsideRoot(absPath: string): boolean {
  const rel = relative(ROOT, absPath)
  return Boolean(rel) && !rel.startsWith('..') && resolve(rel) !== rel
}

describe('resolveSafeImagePathFromRoot', () => {
  it('resolves a valid relative media URL', () => {
    const path = resolveSafeImagePathFromRoot('media://local/machines/a.jpg', ROOT)
    expect(path).toBe(resolve(ROOT, 'machines/a.jpg'))
    expect(isInsideRoot(path!)).toBe(true)
  })

  it('allows nested parts paths', () => {
    const path = resolveSafeImagePathFromRoot('media://local/parts/uuid.png', ROOT)
    expect(path).toBe(resolve(ROOT, 'parts/uuid.png'))
  })

  it('never resolves outside the images root (URL .. is collapsed safely)', () => {
    const attacks = [
      'media://local/../secret.txt',
      'media://local/machines/../../secret.txt',
      'media://local/parts/foo/../../../etc/passwd',
      'media://local/%2e%2e/secret.txt'
    ]
    for (const url of attacks) {
      const path = resolveSafeImagePathFromRoot(url, ROOT)
      if (path != null) {
        expect(isInsideRoot(path)).toBe(true)
      }
    }
  })

  it('rejects wrong scheme or host', () => {
    expect(resolveSafeImagePathFromRoot('file:///machines/a.jpg', ROOT)).toBeNull()
    expect(resolveSafeImagePathFromRoot('media://other/machines/a.jpg', ROOT)).toBeNull()
  })

  it('rejects empty path', () => {
    expect(resolveSafeImagePathFromRoot('media://local/', ROOT)).toBeNull()
  })

  it('rejects null bytes in path', () => {
    expect(resolveSafeImagePathFromRoot('media://local/machines/a.jpg%00.txt', ROOT)).toBeNull()
  })
})
