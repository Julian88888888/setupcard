import { create } from 'zustand'
import type { PartCreate, PartDetail, PartListItem, PartUpdate } from '../../../shared/schemas'

export type PartsView = 'list' | 'details' | 'form'

interface PartsState {
  parts: PartListItem[]
  selected: PartDetail | null
  view: PartsView
  formMode: 'create' | 'edit'
  searchQuery: string
  loading: boolean
  error: string | null
  deleteTarget: PartListItem | PartDetail | null

  setSearchQuery: (query: string) => void
  openCreate: () => void
  openEdit: (part: PartDetail) => void
  openDetails: (id: number) => Promise<void>
  backToList: () => void
  askDelete: (part: PartListItem | PartDetail) => void
  cancelDelete: () => void
  loadParts: (query?: string) => Promise<void>
  createPart: (data: PartCreate) => Promise<PartDetail>
  updatePart: (data: PartUpdate) => Promise<PartDetail>
  deletePart: (id: number) => Promise<void>
  pickFixturePhoto: () => Promise<string | null>
  pickTransitionPhoto: () => Promise<string | null>
}

export const usePartsStore = create<PartsState>((set, get) => ({
  parts: [],
  selected: null,
  view: 'list',
  formMode: 'create',
  searchQuery: '',
  loading: false,
  error: null,
  deleteTarget: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  openCreate: () =>
    set({
      view: 'form',
      formMode: 'create',
      selected: null,
      error: null
    }),

  openEdit: (part) =>
    set({
      view: 'form',
      formMode: 'edit',
      selected: part,
      error: null
    }),

  openDetails: async (id) => {
    set({ loading: true, error: null })
    try {
      const selected = await window.api.parts.get(id)
      if (!selected) {
        set({ error: 'Деталь не знайдено', view: 'list' })
        return
      }
      set({ selected, view: 'details' })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
    } finally {
      set({ loading: false })
    }
  },

  backToList: () =>
    set({
      view: 'list',
      selected: null,
      formMode: 'create',
      error: null
    }),

  askDelete: (part) => set({ deleteTarget: part }),
  cancelDelete: () => set({ deleteTarget: null }),

  loadParts: async (query) => {
    const q = query !== undefined ? query : get().searchQuery
    set({ loading: true, error: null })
    try {
      const parts = await window.api.parts.list(q)
      set({ parts })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
    } finally {
      set({ loading: false })
    }
  },

  createPart: async (data) => {
    set({ loading: true, error: null })
    try {
      const selected = await window.api.parts.create(data)
      await get().loadParts()
      set({ view: 'details', selected, formMode: 'create' })
      return selected
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  updatePart: async (data) => {
    set({ loading: true, error: null })
    try {
      const selected = await window.api.parts.update(data)
      await get().loadParts()
      set({ view: 'details', selected })
      return selected
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  deletePart: async (id) => {
    set({ loading: true, error: null })
    try {
      await window.api.parts.delete(id)
      set({ deleteTarget: null, selected: null, view: 'list' })
      await get().loadParts()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  pickFixturePhoto: async () => {
    const result = await window.api.parts.pickFixturePhoto()
    if (result.success && result.path) return result.path
    if (result.error && result.error !== 'cancelled') {
      set({ error: result.error })
    }
    return null
  },

  pickTransitionPhoto: async () => {
    const result = await window.api.parts.pickTransitionPhoto()
    if (result.success && result.path) return result.path
    if (result.error && result.error !== 'cancelled') {
      set({ error: result.error })
    }
    return null
  }
}))
