import { create } from 'zustand'
import type { Machine, MachineCreate, MachineUpdate } from '../../../shared/schemas'

export type MachinesView = 'list' | 'details' | 'form'

interface MachinesState {
  machines: Machine[]
  selectedId: number | null
  view: MachinesView
  /** 'create' | machine id being edited */
  formMode: 'create' | 'edit'
  searchQuery: string
  loading: boolean
  error: string | null
  deleteTarget: Machine | null

  setSearchQuery: (query: string) => void
  setView: (view: MachinesView) => void
  openCreate: () => void
  openEdit: (machine: Machine) => void
  openDetails: (machine: Machine) => void
  backToList: () => void
  askDelete: (machine: Machine) => void
  cancelDelete: () => void
  loadMachines: (query?: string) => Promise<void>
  createMachine: (data: MachineCreate) => Promise<Machine>
  updateMachine: (data: MachineUpdate) => Promise<Machine>
  deleteMachine: (id: number) => Promise<void>
  pickPhoto: () => Promise<string | null>
}

export const useMachinesStore = create<MachinesState>((set, get) => ({
  machines: [],
  selectedId: null,
  view: 'list',
  formMode: 'create',
  searchQuery: '',
  loading: false,
  error: null,
  deleteTarget: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setView: (view) => set({ view }),

  openCreate: () =>
    set({
      view: 'form',
      formMode: 'create',
      selectedId: null,
      error: null
    }),

  openEdit: (machine) =>
    set({
      view: 'form',
      formMode: 'edit',
      selectedId: machine.id,
      error: null
    }),

  openDetails: (machine) =>
    set({
      view: 'details',
      selectedId: machine.id,
      error: null
    }),

  backToList: () =>
    set({
      view: 'list',
      selectedId: null,
      formMode: 'create',
      error: null
    }),

  askDelete: (machine) => set({ deleteTarget: machine }),
  cancelDelete: () => set({ deleteTarget: null }),

  loadMachines: async (query) => {
    const q = query !== undefined ? query : get().searchQuery
    set({ loading: true, error: null })
    try {
      const machines = await window.api.machines.list(q)
      set({ machines })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  createMachine: async (data) => {
    set({ loading: true, error: null })
    try {
      const machine = await window.api.machines.create(data)
      await get().loadMachines()
      set({ view: 'details', selectedId: machine.id, formMode: 'create' })
      return machine
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  updateMachine: async (data) => {
    set({ loading: true, error: null })
    try {
      const machine = await window.api.machines.update(data)
      await get().loadMachines()
      set({ view: 'details', selectedId: machine.id })
      return machine
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  deleteMachine: async (id) => {
    set({ loading: true, error: null })
    try {
      await window.api.machines.delete(id)
      set({ deleteTarget: null, selectedId: null, view: 'list' })
      await get().loadMachines()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  pickPhoto: async () => {
    const result = await window.api.machines.pickPhoto()
    if (result.success && result.path) {
      return result.path
    }
    if (result.error && result.error !== 'cancelled') {
      set({ error: result.error })
    }
    return null
  }
}))
