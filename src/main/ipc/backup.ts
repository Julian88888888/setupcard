import { app, dialog, BrowserWindow } from 'electron'
import { join, basename } from 'path'
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  readdirSync,
  statSync
} from 'fs'
import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { closeDatabase, getDatabasePath, getImagesPath, initDatabase } from '../db'
import { logger } from '../logger'
import type { BackupResult } from '../../shared/schemas'

const DB_ENTRY = 'app.db'
const IMAGES_ENTRY = 'images/'

/**
 * Export a zip containing app.db (+ WAL/SHM if present) and the images/ folder.
 * Checkpoint WAL first so the main DB file is consistent.
 */
export async function exportBackup(parent?: BrowserWindow | null): Promise<BackupResult> {
  try {
    const options = {
      title: 'Export backup',
      defaultPath: `setupcard-backup-${formatStamp()}.zip`,
      filters: [{ name: 'SetupCard Backup', extensions: ['zip'] }]
    }
    const { filePath, canceled } = parent
      ? await dialog.showSaveDialog(parent, options)
      : await dialog.showSaveDialog(options)

    if (canceled || !filePath) {
      return { success: false, error: 'cancelled' }
    }

    // Flush WAL into the main DB file before copying
    checkpointWal()

    const zip = new AdmZip()
    const dbPath = getDatabasePath()
    const imagesPath = getImagesPath()

    if (!existsSync(dbPath)) {
      return { success: false, error: 'Database file not found' }
    }

    zip.addLocalFile(dbPath, '', DB_ENTRY)

    // Include sidecar files if they exist (should be empty after checkpoint)
    for (const side of [`${dbPath}-wal`, `${dbPath}-shm`]) {
      if (existsSync(side)) {
        zip.addLocalFile(side, '', basename(side))
      }
    }

    if (existsSync(imagesPath)) {
      addFolderToZip(zip, imagesPath, IMAGES_ENTRY)
    }

    zip.writeZip(filePath)
    logger.info('Backup exported to:', filePath)
    return { success: true, path: filePath }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Backup export failed:', message)
    return { success: false, error: message }
  }
}

/**
 * Import a backup zip: replace app.db and images/, then reopen the database.
 */
export async function importBackup(parent?: BrowserWindow | null): Promise<BackupResult> {
  try {
    const options = {
      title: 'Import backup',
      filters: [{ name: 'SetupCard Backup', extensions: ['zip'] }],
      properties: ['openFile' as const]
    }
    const { filePaths, canceled } = parent
      ? await dialog.showOpenDialog(parent, options)
      : await dialog.showOpenDialog(options)

    if (canceled || !filePaths?.[0]) {
      return { success: false, error: 'cancelled' }
    }

    const zipPath = filePaths[0]
    const zip = new AdmZip(zipPath)
    const entries = zip.getEntries()

    const dbEntry = entries.find((e) => e.entryName === DB_ENTRY || e.entryName.endsWith(`/${DB_ENTRY}`))
    if (!dbEntry || dbEntry.isDirectory) {
      return { success: false, error: 'Backup does not contain app.db' }
    }

    const userData = app.getPath('userData')
    const staging = join(userData, '.backup-import-tmp')
    rmSync(staging, { recursive: true, force: true })
    mkdirSync(staging, { recursive: true })

    zip.extractAllTo(staging, true)

    const stagedDb = join(staging, DB_ENTRY)
    if (!existsSync(stagedDb)) {
      // Some zips nest the file — search one level
      const nested = findFile(staging, DB_ENTRY)
      if (!nested) {
        rmSync(staging, { recursive: true, force: true })
        return { success: false, error: 'Could not extract app.db from backup' }
      }
      copyFileSync(nested, stagedDb)
    }

    // Close DB before replacing files
    closeDatabase()

    const dbPath = getDatabasePath()
    const imagesPath = getImagesPath()

    // Remove old WAL/SHM so we don't mix with a restored DB
    for (const side of [`${dbPath}-wal`, `${dbPath}-shm`]) {
      rmSync(side, { force: true })
    }

    copyFileSync(stagedDb, dbPath)

    // Replace images folder
    rmSync(imagesPath, { recursive: true, force: true })
    mkdirSync(imagesPath, { recursive: true })

    const stagedImages = join(staging, 'images')
    if (existsSync(stagedImages) && statSync(stagedImages).isDirectory()) {
      copyDirRecursive(stagedImages, imagesPath)
    }

    rmSync(staging, { recursive: true, force: true })

    // Reopen DB + run migrations (in case backup is from an older schema)
    initDatabase()

    logger.info('Backup imported from:', zipPath)
    return { success: true, path: zipPath }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Backup import failed:', message)
    // Best-effort reopen so the app stays usable
    try {
      initDatabase()
    } catch (reopenErr) {
      logger.error('Failed to reopen database after import error:', reopenErr)
    }
    return { success: false, error: message }
  }
}

function checkpointWal(): void {
  try {
    // Short-lived connection so we can TRUNCATE-checkpoint without going through Drizzle
    const tmp = new Database(getDatabasePath())
    tmp.pragma('wal_checkpoint(TRUNCATE)')
    tmp.close()
  } catch (err) {
    logger.warn('WAL checkpoint skipped:', err)
  }
}

function addFolderToZip(zip: AdmZip, folderPath: string, zipPrefix: string): void {
  const entries = readdirSync(folderPath)
  for (const name of entries) {
    const full = join(folderPath, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      addFolderToZip(zip, full, `${zipPrefix}${name}/`)
    } else {
      zip.addLocalFile(full, zipPrefix.replace(/\/$/, ''), name)
    }
  }
}

function copyDirRecursive(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true })
  for (const name of readdirSync(src)) {
    const from = join(src, name)
    const to = join(dest, name)
    if (statSync(from).isDirectory()) {
      copyDirRecursive(from, to)
    } else {
      copyFileSync(from, to)
    }
  }
}

function findFile(root: string, fileName: string): string | null {
  for (const name of readdirSync(root)) {
    const full = join(root, name)
    if (statSync(full).isDirectory()) {
      const found = findFile(full, fileName)
      if (found) return found
    } else if (name === fileName) {
      return full
    }
  }
  return null
}

function formatStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}
