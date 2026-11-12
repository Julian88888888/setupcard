/**
 * Central registry of IPC channel names.
 * Keep channel strings here so main, preload, and shared stay in sync.
 */
export const IpcChannels = {
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Items (example CRUD entity)
  ITEMS_LIST: 'items:list',
  ITEMS_GET: 'items:get',
  ITEMS_CREATE: 'items:create',
  ITEMS_UPDATE: 'items:update',
  ITEMS_DELETE: 'items:delete',

  // Backup
  BACKUP_EXPORT: 'backup:export',
  BACKUP_IMPORT: 'backup:import',

  // App info
  APP_GET_PATHS: 'app:get-paths'
} as const

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels]
