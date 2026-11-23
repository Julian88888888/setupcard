import { app, dialog, BrowserWindow } from 'electron'
import { join } from 'path'
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  readdirSync,
  statSync,
  readFileSync
} from 'fs'
import AdmZip from 'adm-zip'
import { closeDatabase, getImagesPath, getPool, initDatabase } from '../db'
import { logger } from '../logger'
import type { BackupResult } from '../../shared/schemas'

const DUMP_ENTRY = 'dump.sql'
const IMAGES_ENTRY = 'images/'

/**
 * Export a zip containing dump.sql (logical INSERT dump) and the images/ folder.
 * Does not require pg_dump on the host.
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

    const dumpSql = await buildLogicalDump()
    const zip = new AdmZip()
    zip.addFile(DUMP_ENTRY, Buffer.from(dumpSql, 'utf-8'))

    const imagesPath = getImagesPath()
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
 * Import a backup zip: restore dump.sql + images/, then reopen the database.
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

    const dumpEntry = entries.find(
      (e) => e.entryName === DUMP_ENTRY || e.entryName.endsWith(`/${DUMP_ENTRY}`)
    )
    if (!dumpEntry || dumpEntry.isDirectory) {
      return { success: false, error: 'Backup does not contain dump.sql' }
    }

    const userData = app.getPath('userData')
    const staging = join(userData, '.backup-import-tmp')
    rmSync(staging, { recursive: true, force: true })
    mkdirSync(staging, { recursive: true })

    zip.extractAllTo(staging, true)

    let stagedDump = join(staging, DUMP_ENTRY)
    if (!existsSync(stagedDump)) {
      const nested = findFile(staging, DUMP_ENTRY)
      if (!nested) {
        rmSync(staging, { recursive: true, force: true })
        return { success: false, error: 'Could not extract dump.sql from backup' }
      }
      stagedDump = nested
    }

    const dumpSql = readFileSync(stagedDump, 'utf-8')
    const pool = getPool()

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(`
        TRUNCATE TABLE
          part_photos,
          parts,
          materials,
          workpiece_types,
          machines,
          settings
        RESTART IDENTITY CASCADE
      `)
      await client.query(dumpSql)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    const imagesPath = getImagesPath()
    rmSync(imagesPath, { recursive: true, force: true })
    mkdirSync(imagesPath, { recursive: true })

    const stagedImages = join(staging, 'images')
    if (existsSync(stagedImages) && statSync(stagedImages).isDirectory()) {
      copyDirRecursive(stagedImages, imagesPath)
    }

    rmSync(staging, { recursive: true, force: true })

    logger.info('Backup imported from:', zipPath)
    return { success: true, path: zipPath }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Backup import failed:', message)
    try {
      await closeDatabase()
      await initDatabase()
    } catch (reopenErr) {
      logger.error('Failed to reopen database after import error:', reopenErr)
    }
    return { success: false, error: message }
  }
}

async function buildLogicalDump(): Promise<string> {
  const pool = getPool()
  const lines: string[] = [
    '-- SetupCard logical dump',
    'SET session_replication_role = replica;',
    ''
  ]

  const tables: Array<{
    table: string
    sequence: string
    select: string
  }> = [
    {
      table: 'settings',
      sequence: '',
      select: 'SELECT key, value FROM settings'
    },
    {
      table: 'machines',
      sequence: 'machines_id_seq',
      select: `SELECT id, name, inventory_number, machine_type, control_system_type, spindle_taper,
        max_spindle_speed, magazine_capacity, max_tool_length, max_tool_diameter, max_tool_weight,
        table_size, axis_travel, table_load_capacity, max_workpiece_size, number_of_tables,
        photo_path, notes, created_at, updated_at FROM machines ORDER BY id`
    },
    {
      table: 'materials',
      sequence: 'materials_id_seq',
      select:
        'SELECT id, name, category, color, notes, created_at, updated_at FROM materials ORDER BY id'
    },
    {
      table: 'workpiece_types',
      sequence: 'workpiece_types_id_seq',
      select:
        'SELECT id, name, notes, created_at, updated_at FROM workpiece_types ORDER BY id'
    },
    {
      table: 'parts',
      sequence: 'parts_id_seq',
      select: `SELECT id, code, name, material_id, workpiece_type_id, notes, created_at, updated_at
        FROM parts ORDER BY id`
    },
    {
      table: 'part_photos',
      sequence: 'part_photos_id_seq',
      select: 'SELECT id, part_id, photo_path, sort_order FROM part_photos ORDER BY id'
    }
  ]

  for (const spec of tables) {
    const result = await pool.query(spec.select)
    if (result.rows.length === 0) continue

    const columns = result.fields.map((f) => f.name)
    for (const row of result.rows) {
      const values = columns.map((col) => sqlLiteral((row as Record<string, unknown>)[col]))
      lines.push(
        `INSERT INTO ${spec.table} (${columns.map(quoteIdent).join(', ')}) VALUES (${values.join(', ')});`
      )
    }

    if (spec.sequence) {
      lines.push(
        `SELECT setval('${spec.sequence}', COALESCE((SELECT MAX(id) FROM ${spec.table}), 1), true);`
      )
    }
    lines.push('')
  }

  lines.push('SET session_replication_role = DEFAULT;')
  lines.push('')
  return lines.join('\n')
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NULL'
    return String(value)
  }
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  const text = String(value)
  return `'${text.replace(/'/g, "''")}'`
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
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
