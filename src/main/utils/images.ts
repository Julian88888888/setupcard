import { randomUUID } from 'crypto'
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { extname, join } from 'path'
import { BrowserWindow, dialog } from 'electron'
import { getImagesPath } from '../db'
import { logger } from '../logger'

const ALLOWED_PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'])

export type SavedPhotoResult =
  | { success: true; path: string; paths: string[] }
  | { success: false; error: string }

/**
 * Open a file dialog, copy image(s) into userData/images/<subdir>/, return relative path(s).
 */
export async function pickAndSaveImage(
  parent: BrowserWindow | null,
  options: { title: string; subdir: string; multiple?: boolean }
): Promise<SavedPhotoResult> {
  const dialogOptions = {
    title: options.title,
    properties: options.multiple
      ? (['openFile', 'multiSelections'] as const)
      : (['openFile'] as const),
    filters: [{ name: 'Зображення', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] }]
  }

  const { filePaths, canceled } = parent
    ? await dialog.showOpenDialog(parent, { ...dialogOptions, properties: [...dialogOptions.properties] })
    : await dialog.showOpenDialog({ ...dialogOptions, properties: [...dialogOptions.properties] })

  if (canceled || !filePaths?.length) {
    return { success: false, error: 'cancelled' }
  }

  const saved: string[] = []
  try {
    const dir = join(getImagesPath(), options.subdir)
    mkdirSync(dir, { recursive: true })

    for (const sourcePath of filePaths) {
      const ext = extname(sourcePath).toLowerCase()
      if (!ALLOWED_PHOTO_EXTENSIONS.has(ext)) {
        continue
      }
      const fileName = `${randomUUID()}${ext}`
      copyFileSync(sourcePath, join(dir, fileName))
      const relativePath = `${options.subdir}/${fileName}`
      saved.push(relativePath)
      logger.info('Image saved:', relativePath)
    }

    if (saved.length === 0) {
      return { success: false, error: 'Непідтримуваний формат зображення' }
    }

    return { success: true, path: saved[0], paths: saved }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Failed to save image:', message)
    return { success: false, error: message }
  }
}

export function deleteImageFile(relativePath: string | null | undefined): void {
  if (!relativePath) return
  try {
    const abs = join(getImagesPath(), relativePath)
    if (existsSync(abs)) {
      unlinkSync(abs)
    }
  } catch (err) {
    logger.warn('Could not delete image file:', relativePath, err)
  }
}
