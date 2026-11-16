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

  // Machines (Верстати)
  MACHINES_LIST: 'machines:list',
  MACHINES_GET: 'machines:get',
  MACHINES_CREATE: 'machines:create',
  MACHINES_UPDATE: 'machines:update',
  MACHINES_DELETE: 'machines:delete',
  MACHINES_PICK_PHOTO: 'machines:pick-photo',

  // Parts (Деталі)
  PARTS_LIST: 'parts:list',
  PARTS_GET: 'parts:get',
  PARTS_CREATE: 'parts:create',
  PARTS_UPDATE: 'parts:update',
  PARTS_DELETE: 'parts:delete',
  PARTS_PICK_FIXTURE_PHOTO: 'parts:pick-fixture-photo',
  PARTS_PICK_TRANSITION_PHOTO: 'parts:pick-transition-photo',

  // Backup
  BACKUP_EXPORT: 'backup:export',
  BACKUP_IMPORT: 'backup:import',

  // App info
  APP_GET_PATHS: 'app:get-paths'
} as const

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels]
