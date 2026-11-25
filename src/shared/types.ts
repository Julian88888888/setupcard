import type {
  AppPaths,
  BackupResult,
  Machine,
  MachineCreate,
  MachinePhotoResult,
  MachineUpdate,
  Material,
  MaterialCreate,
  MaterialUpdate,
  PartCreate,
  PartDetail,
  PartListItem,
  PartUpdate,
  PhotoResult,
  Settings,
  SettingsUpdate,
  WorkpieceType,
  WorkpieceTypeCreate,
  WorkpieceTypeUpdate
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
  machines: {
    list: (query?: string) => Promise<Machine[]>
    get: (id: number) => Promise<Machine | null>
    create: (data: MachineCreate) => Promise<Machine>
    update: (data: MachineUpdate) => Promise<Machine>
    delete: (id: number) => Promise<{ success: boolean }>
    pickPhoto: () => Promise<MachinePhotoResult>
  }
  materials: {
    list: () => Promise<Material[]>
    create: (data: MaterialCreate) => Promise<Material>
    update: (data: MaterialUpdate) => Promise<Material>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  workpieceTypes: {
    list: () => Promise<WorkpieceType[]>
    create: (data: WorkpieceTypeCreate) => Promise<WorkpieceType>
    update: (data: WorkpieceTypeUpdate) => Promise<WorkpieceType>
    delete: (id: number) => Promise<{ success: boolean }>
  }
  parts: {
    list: (query?: string) => Promise<PartListItem[]>
    get: (id: number) => Promise<PartDetail | null>
    create: (data: PartCreate) => Promise<PartDetail>
    update: (data: PartUpdate) => Promise<PartDetail>
    delete: (id: number) => Promise<{ success: boolean }>
    pickPhoto: () => Promise<PhotoResult>
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
