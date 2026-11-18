import { join, normalize, relative, resolve, sep } from 'path'

const SCHEME = 'media'
const HOST = 'local'

/**
 * Pure path check for media://local/... — no Electron dependency.
 * Returns absolute path under imagesRoot, or null if unsafe/invalid.
 */
export function resolveSafeImagePathFromRoot(
  requestUrl: string,
  imagesRootInput: string
): string | null {
  let pathname: string
  try {
    const url = new URL(requestUrl)
    if (url.protocol !== `${SCHEME}:` || url.hostname !== HOST) {
      return null
    }
    pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '')
  } catch {
    return null
  }

  if (!pathname || pathname.includes('\0')) {
    return null
  }

  const imagesRoot = resolve(imagesRootInput)

  const candidate = normalize(pathname)
    .replace(/^[A-Za-z]:/, '')
    .replace(/^[/\\]+/, '')

  if (!candidate || candidate.split(/[/\\]/).includes('..')) {
    return null
  }

  const resolved = resolve(join(imagesRoot, candidate))
  const rel = relative(imagesRoot, resolved)

  if (!rel || rel.startsWith('..') || resolve(rel) === rel) {
    return null
  }

  if (resolved !== imagesRoot && !resolved.startsWith(imagesRoot + sep)) {
    return null
  }

  return resolved
}
