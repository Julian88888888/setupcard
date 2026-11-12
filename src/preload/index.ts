import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type { ElectronAPI } from '../shared/types'
import type { ItemCreate, ItemUpdate, SettingsUpdate } from '../shared/schemas'

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
  backup: {
    export: () => ipcRenderer.invoke(IpcChannels.BACKUP_EXPORT),
    import: () => ipcRenderer.invoke(IpcChannels.BACKUP_IMPORT)
  },
  app: {
    getPaths: () => ipcRenderer.invoke(IpcChannels.APP_GET_PATHS)
  }
}

contextBridge.exposeInMainWorld('api', api)
