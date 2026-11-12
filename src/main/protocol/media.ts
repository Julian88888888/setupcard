import { protocol, net } from 'electron'
import { join, normalize, relative, resolve, sep } from 'path'
import { pathToFileURL } from 'url'
import { getImagesPath } from '../db'
import { logger } from '../logger'

/**
 * Custom protocol: media://local/<relative-path>
 *
 * Serves files from userData/images/ with path-traversal protection.
 * Example: media://local/photo.jpg  →  {userData}/images/photo.jpg
 *
 * Register the scheme as privileged before app.ready, then call
 * registerMediaProtocol() after ready.
 */

const SCHEME = 'media'
const HOST = 'local'

/** Call in app lifecycle before `ready` so the scheme can use standard fetch APIs. */
export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: false,
        stream: true
      }
    }
  ])
}

/** Bind the protocol handler after `app.whenReady()`. */
export function registerMediaProtocol(): void {
  protocol.handle(SCHEME, (request) => {
    try {
      const filePath = resolveSafeImagePath(request.url)
      if (!filePath) {
        logger.warn('Blocked media request (invalid/traversal):', request.url)
        return new Response('Not Found', { status: 404 })
      }
      return net.fetch(pathToFileURL(filePath).toString())
    } catch (err) {
      logger.error('media:// handler error:', err)
      return new Response('Internal Error', { status: 500 })
    }
  })

  logger.info('Registered media:// protocol')
}

/**
 * Parse media://local/... and ensure the resolved path stays inside images/.
 * Returns null if the path is unsafe or empty.
 */
export function resolveSafeImagePath(requestUrl: string): string | null {
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

  const imagesRoot = resolve(getImagesPath())

  // Strip any drive letter / absolute prefix, normalize, reject ".." segments
  const candidate = normalize(pathname)
    .replace(/^[A-Za-z]:/, '')
    .replace(/^[/\\]+/, '')

  if (!candidate || candidate.split(/[/\\]/).includes('..')) {
    return null
  }

  const resolved = resolve(join(imagesRoot, candidate))
  const rel = relative(imagesRoot, resolved)

  // Outside imagesRoot → relative path starts with .. or is absolute
  if (!rel || rel.startsWith('..') || resolve(rel) === rel) {
    return null
  }

  // Extra belt-and-suspenders check for Windows / Unix
  if (resolved !== imagesRoot && !resolved.startsWith(imagesRoot + sep)) {
    return null
  }

  return resolved
}
