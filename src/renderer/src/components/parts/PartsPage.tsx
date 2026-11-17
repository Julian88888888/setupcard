import { useEffect } from 'react'
import type { PartCreate } from '../../../../shared/schemas'
import { usePartsStore } from '../../store/usePartsStore'
import { DeletePartDialog } from './DeletePartDialog'
import { PartDetails } from './PartDetails'
import { PartForm } from './PartForm'
import { PartsList } from './PartsList'

export function PartsPage(): JSX.Element {
  const {
    parts,
    selected,
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
    loadParts,
    createPart,
    updatePart,
    deletePart,
    pickPhoto
  } = usePartsStore()

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadParts(searchQuery)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [searchQuery, loadParts])

  const handleSubmit = async (data: PartCreate): Promise<void> => {
    if (formMode === 'edit' && selected) {
      await updatePart({ id: selected.id, ...data })
    } else {
      await createPart(data)
    }
  }

  return (
    <div className="relative">
      {view === 'list' && (
        <PartsList
          parts={parts}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={openCreate}
          onOpen={(id) => void openDetails(id)}
        />
      )}

      {view === 'details' && selected && (
        <PartDetails
          part={selected}
          onBack={backToList}
          onEdit={() => openEdit(selected)}
          onDelete={() => askDelete(selected)}
        />
      )}

      {view === 'form' && (
        <PartForm
          key={`${formMode}-${selected?.id ?? 'new'}`}
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
        <DeletePartDialog
          title={`${deleteTarget.code} — ${deleteTarget.name}`}
          loading={loading}
          onCancel={cancelDelete}
          onConfirm={() => void deletePart(deleteTarget.id)}
        />
      )}
    </div>
  )
}
