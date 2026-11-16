import { useEffect, useMemo } from 'react'
import type { MachineCreate } from '../../../../shared/schemas'
import { useMachinesStore } from '../../store/useMachinesStore'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { MachineDetails } from './MachineDetails'
import { MachineForm } from './MachineForm'
import { MachinesList } from './MachinesList'

export function MachinesPage(): JSX.Element {
  const {
    machines,
    selectedId,
    view,
    formMode,
    searchQuery,
    loading,
    error,
    deleteTarget,
    setSearchQuery,
    openCreate,
    openEdit,
    openDetails,
    backToList,
    askDelete,
    cancelDelete,
    loadMachines,
    createMachine,
    updateMachine,
    deleteMachine,
    pickPhoto
  } = useMachinesStore()

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadMachines(searchQuery)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [searchQuery, loadMachines])

  const selected = useMemo(
    () => machines.find((m) => m.id === selectedId) ?? null,
    [machines, selectedId]
  )

  const handleSubmit = async (data: MachineCreate): Promise<void> => {
    if (formMode === 'edit' && selectedId) {
      await updateMachine({ id: selectedId, ...data })
    } else {
      await createMachine(data)
    }
  }

  return (
    <div className="relative">
      {view === 'list' && (
        <MachinesList
          machines={machines}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={openCreate}
          onOpen={openDetails}
        />
      )}

      {view === 'details' && selected && (
        <MachineDetails
          machine={selected}
          onBack={backToList}
          onEdit={() => openEdit(selected)}
          onDelete={() => askDelete(selected)}
        />
      )}

      {view === 'details' && !selected && (
        <div className="space-y-4">
          <p className="text-ink-muted">Верстат не знайдено.</p>
          <button
            type="button"
            onClick={backToList}
            className="text-sm text-accent hover:underline"
          >
            Повернутися до списку
          </button>
        </div>
      )}

      {view === 'form' && (
        <MachineForm
          key={`${formMode}-${selectedId ?? 'new'}`}
          mode={formMode}
          initial={formMode === 'edit' ? selected : null}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={backToList}
          onPickPhoto={pickPhoto}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          machine={deleteTarget}
          loading={loading}
          onCancel={cancelDelete}
          onConfirm={() => void deleteMachine(deleteTarget.id)}
        />
      )}
    </div>
  )
}
