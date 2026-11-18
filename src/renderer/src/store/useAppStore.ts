import { create } from 'zustand'
import type { Settings, AppPaths } from '../../../shared/schemas'

export type AppSection =
  | 'machines'
  | 'parts'
  | 'materials'
  | 'workpieceTypes'
  | 'help'
  | 'settings'

interface AppState {
  section: AppSection
  settings: Settings | null
  paths: AppPaths | null
  statusMessage: string | null
  loading: boolean

  setSection: (section: AppSection) => void
  setStatusMessage: (msg: string | null) => void
  loadSettings: () => Promise<void>
  saveSettings: (update: Partial<Settings>) => Promise<void>
  loadPaths: () => Promise<void>
  exportBackup: () => Promise<void>
  importBackup: () => Promise<void>
}

/**
 * Zustand store — UI state lives here; persistent data goes through window.api → main → PostgreSQL.
 */
export const useAppStore = create<AppState>((set, get) => ({
  section: 'machines',
  settings: null,
  paths: null,
  statusMessage: null,
  loading: false,

  setSection: (section) => set({ section, statusMessage: null }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),

  loadSettings: async () => {
    const settings = await window.api.settings.get()
    set({ settings })
  },

  saveSettings: async (update) => {
    set({ loading: true })
    try {
      const settings = await window.api.settings.set(update)
      set({ settings, statusMessage: 'Налаштування збережено' })
    } finally {
      set({ loading: false })
    }
  },

  loadPaths: async () => {
    const paths = await window.api.app.getPaths()
    set({ paths })
  },

  exportBackup: async () => {
    set({ loading: true, statusMessage: null })
    try {
      const result = await window.api.backup.export()
      if (result.success) {
        set({ statusMessage: `Резервну копію збережено: ${result.path}` })
      } else if (result.error !== 'cancelled') {
        set({ statusMessage: `Помилка експорту: ${result.error}` })
      }
    } finally {
      set({ loading: false })
    }
  },

  importBackup: async () => {
    set({ loading: true, statusMessage: null })
    try {
      const result = await window.api.backup.import()
      if (result.success) {
        await get().loadSettings()
        set({ statusMessage: 'Резервну копію імпортовано' })
      } else if (result.error !== 'cancelled') {
        set({ statusMessage: `Помилка імпорту: ${result.error}` })
      }
    } finally {
      set({ loading: false })
    }
  }
}))
