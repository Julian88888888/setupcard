import type { AppPaths, BackupResult, Item, ItemCreate, ItemUpdate, Settings, SettingsUpdate } from './schemas'

/**
 * Typed API exposed to the renderer via contextBridge.
 * Every method maps to a Zod-validated IPC handler in the main process.
 */
export interface ElectronAPI {
  settings: {
    get: () => Promise<Settings>
    set: (update: SettingsUpdate) => Promise<Settings>
  }
  items: {
    list: () => Promise<Item[]>
    get: (id: number) => Promise<Item | null>
    create: (data: ItemCreate) => Promise<Item>
    update: (data: ItemUpdate) => Promise<Item>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  backup: {
    export: () => Promise<BackupResult>
    import: () => Promise<BackupResult>
  }
  app: {
    getPaths: () => Promise<AppPaths>
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

export {}
