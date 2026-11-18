import { protocol, net } from 'electron'
import { pathToFileURL } from 'url'
import { getImagesPath } from '../db'
import { logger } from '../logger'
import { resolveSafeImagePathFromRoot } from './media-path'

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
  return resolveSafeImagePathFromRoot(requestUrl, getImagesPath())
}

export { resolveSafeImagePathFromRoot } from './media-path'
