import type {
  AppPaths,
  BackupResult,
  Item,
  ItemCreate,
  ItemUpdate,
  Machine,
  MachineCreate,
  MachinePhotoResult,
  MachineUpdate,
  PartCreate,
  PartDetail,
  PartListItem,
  PartUpdate,
  PhotoResult,
  Settings,
  SettingsUpdate
} from './schemas'

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
  machines: {
    list: (query?: string) => Promise<Machine[]>
    get: (id: number) => Promise<Machine | null>
    create: (data: MachineCreate) => Promise<Machine>
    update: (data: MachineUpdate) => Promise<Machine>
    delete: (id: number) => Promise<{ success: boolean }>
    pickPhoto: () => Promise<MachinePhotoResult>
  }
  parts: {
    list: (query?: string) => Promise<PartListItem[]>
    get: (id: number) => Promise<PartDetail | null>
    create: (data: PartCreate) => Promise<PartDetail>
    update: (data: PartUpdate) => Promise<PartDetail>
    delete: (id: number) => Promise<{ success: boolean }>
    pickFixturePhoto: () => Promise<PhotoResult>
    pickTransitionPhoto: () => Promise<PhotoResult>
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
