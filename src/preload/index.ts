import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type { ElectronAPI } from '../shared/types'
import type {
  ItemCreate,
  ItemUpdate,
  MachineCreate,
  MachineUpdate,
  MaterialCreate,
  MaterialUpdate,
  PartCreate,
  PartUpdate,
  SettingsUpdate,
  WorkpieceTypeCreate,
  WorkpieceTypeUpdate
} from '../shared/schemas'

/**
 * Preload script — the only bridge between renderer and main.
 * Exposes a typed, narrow API via contextBridge. No Node.js APIs leak to the page.
 */
const api: ElectronAPI = {
  settings: {
    get: () => ipcRenderer.invoke(IpcChannels.SETTINGS_GET),
    set: (update: SettingsUpdate) => ipcRenderer.invoke(IpcChannels.SETTINGS_SET, update)
  },
  items: {
    list: () => ipcRenderer.invoke(IpcChannels.ITEMS_LIST),
    get: (id: number) => ipcRenderer.invoke(IpcChannels.ITEMS_GET, id),
    create: (data: ItemCreate) => ipcRenderer.invoke(IpcChannels.ITEMS_CREATE, data),
    update: (data: ItemUpdate) => ipcRenderer.invoke(IpcChannels.ITEMS_UPDATE, data),
    delete: (id: number) => ipcRenderer.invoke(IpcChannels.ITEMS_DELETE, id)
  },
  machines: {
    list: (query?: string) => ipcRenderer.invoke(IpcChannels.MACHINES_LIST, query ?? ''),
    get: (id: number) => ipcRenderer.invoke(IpcChannels.MACHINES_GET, id),
    create: (data: MachineCreate) => ipcRenderer.invoke(IpcChannels.MACHINES_CREATE, data),
    update: (data: MachineUpdate) => ipcRenderer.invoke(IpcChannels.MACHINES_UPDATE, data),
    delete: (id: number) => ipcRenderer.invoke(IpcChannels.MACHINES_DELETE, id),
    pickPhoto: () => ipcRenderer.invoke(IpcChannels.MACHINES_PICK_PHOTO)
  },
  materials: {
    list: () => ipcRenderer.invoke(IpcChannels.MATERIALS_LIST),
    create: (data: MaterialCreate) => ipcRenderer.invoke(IpcChannels.MATERIALS_CREATE, data),
    update: (data: MaterialUpdate) => ipcRenderer.invoke(IpcChannels.MATERIALS_UPDATE, data),
    delete: (id: number) => ipcRenderer.invoke(IpcChannels.MATERIALS_DELETE, id)
  },
  workpieceTypes: {
    list: () => ipcRenderer.invoke(IpcChannels.WORKPIECE_TYPES_LIST),
    create: (data: WorkpieceTypeCreate) =>
      ipcRenderer.invoke(IpcChannels.WORKPIECE_TYPES_CREATE, data),
    update: (data: WorkpieceTypeUpdate) =>
      ipcRenderer.invoke(IpcChannels.WORKPIECE_TYPES_UPDATE, data),
    delete: (id: number) => ipcRenderer.invoke(IpcChannels.WORKPIECE_TYPES_DELETE, id)
  },
  parts: {
    list: (query?: string) => ipcRenderer.invoke(IpcChannels.PARTS_LIST, query ?? ''),
    get: (id: number) => ipcRenderer.invoke(IpcChannels.PARTS_GET, id),
    create: (data: PartCreate) => ipcRenderer.invoke(IpcChannels.PARTS_CREATE, data),
    update: (data: PartUpdate) => ipcRenderer.invoke(IpcChannels.PARTS_UPDATE, data),
    delete: (id: number) => ipcRenderer.invoke(IpcChannels.PARTS_DELETE, id),
    pickPhoto: () => ipcRenderer.invoke(IpcChannels.PARTS_PICK_PHOTO)
  },
  backup: {
    export: () => ipcRenderer.invoke(IpcChannels.BACKUP_EXPORT),
    import: () => ipcRenderer.invoke(IpcChannels.BACKUP_IMPORT)
  },
  app: {
    getPaths: () => ipcRenderer.invoke(IpcChannels.APP_GET_PATHS)
  }
}

contextBridge.exposeInMainWorld('api', api)
