import { FormEvent, useEffect, useState } from 'react'
import type {
  Material,
  MaterialCategory,
  PartCreate,
  PartDetail,
  WorkpieceType
} from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'
import { IsoGroupBadge } from '../catalogs/IsoGroupBadge'
import {
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_DEFAULT_COLORS,
  materialGroupTitle
} from '../catalogs/labels'

interface PartFormProps {
  mode: 'create' | 'edit'
  initial?: PartDetail | null
  loading: boolean
  error: string | null
  onSubmit: (data: PartCreate) => Promise<void>
  onCancel: () => void
  onPickPhoto: () => Promise<string[]>
}

interface FormState {
  code: string
  name: string
  materialId: number | null
  workpieceTypeId: number | null
  notes: string
  photoPaths: string[]
}

type FieldErrors = Partial<Record<'code' | 'name', string>>

export function PartForm({
  mode,
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
  onPickPhoto
}: PartFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [materials, setMaterials] = useState<Material[]>([])
  const [workpieceTypes, setWorkpieceTypes] = useState<WorkpieceType[]>([])

  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialCategory, setNewMaterialCategory] = useState<MaterialCategory>('P')
  const [newMaterialColor, setNewMaterialColor] = useState(MATERIAL_CATEGORY_DEFAULT_COLORS.P)
  const [newWorkpieceName, setNewWorkpieceName] = useState('')
  const [addingMaterial, setAddingMaterial] = useState(false)
  const [addingWorkpiece, setAddingWorkpiece] = useState(false)

  useEffect(() => {
    void refreshCatalogs()
  }, [])

  const refreshCatalogs = async (): Promise<void> => {
    const [mats, types] = await Promise.all([
      window.api.materials.list(),
      window.api.workpieceTypes.list()
    ])
    setMaterials(mats)
    setWorkpieceTypes(types)
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePickPhoto = async (): Promise<void> => {
    const paths = await onPickPhoto()
    if (paths.length) {
      setForm((prev) => ({ ...prev, photoPaths: [...prev.photoPaths, ...paths] }))
    }
  }

  const removePhoto = (index: number): void => {
    setForm((prev) => ({
      ...prev,
      photoPaths: prev.photoPaths.filter((_, i) => i !== index)
    }))
  }

  const handleAddMaterial = async (): Promise<void> => {
    const name = newMaterialName.trim()
    if (!name) return
    setAddingMaterial(true)
    setSubmitError(null)
    try {
      const created = await window.api.materials.create({
        name,
        category: newMaterialCategory,
        color: newMaterialColor,
        notes: ''
      })
      await refreshCatalogs()
      setField('materialId', created.id)
      setNewMaterialName('')
      setNewMaterialCategory('P')
      setNewMaterialColor(MATERIAL_CATEGORY_DEFAULT_COLORS.P)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    } finally {
      setAddingMaterial(false)
    }
  }

  const handleAddWorkpiece = async (): Promise<void> => {
    const name = newWorkpieceName.trim()
    if (!name) return
    setAddingWorkpiece(true)
    setSubmitError(null)
    try {
      const created = await window.api.workpieceTypes.create({ name, notes: '' })
      await refreshCatalogs()
      setField('workpieceTypeId', created.id)
      setNewWorkpieceName('')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    } finally {
      setAddingWorkpiece(false)
    }
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    const errors: FieldErrors = {}
    if (!form.code.trim()) errors.code = 'Обовʼязкове поле'
    if (!form.name.trim()) errors.name = 'Обовʼязкове поле'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitError(null)
    try {
      await onSubmit({
        code: form.code.trim(),
        name: form.name.trim(),
        materialId: form.materialId,
        workpieceTypeId: form.workpieceTypeId,
        notes: form.notes,
        photoPaths: form.photoPaths
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    }
  }

  const displayError = submitError || error

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">
          {mode === 'create' ? 'Нова деталь' : 'Редагувати деталь'}
        </h1>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-ink-muted transition hover:text-ink"
        >
          Скасувати
        </button>
      </header>

      {displayError && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {displayError}
        </p>
      )}

      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface-raised/50 p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-faint">Основне</h2>

        {/* Номер (код) і матеріал — поруч, як на техкарті */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Номер (код) *</span>
            <input
              value={form.code}
              onChange={(e) => setField('code', e.target.value)}
              disabled={loading}
              placeholder="Напр. креслення / поз."
              className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 font-mono text-ink outline-none focus:border-accent"
            />
            {fieldErrors.code && <span className="text-xs text-red-300">{fieldErrors.code}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Матеріал</span>
            <div className="flex items-center gap-2">
              {(() => {
                const selected = materials.find((m) => m.id === form.materialId)
                return selected ? <IsoGroupBadge category={selected.category} /> : null
              })()}
              <select
                value={form.materialId ?? ''}
                onChange={(e) =>
                  setField('materialId', e.target.value ? Number(e.target.value) : null)
                }
                disabled={loading}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="">— не вибрано —</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({materialGroupTitle(m.category)})
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-muted">Назва *</span>
          <input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent"
          />
          {fieldErrors.name && <span className="text-xs text-red-300">{fieldErrors.name}</span>}
        </label>

        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-white/10 p-3">
          <p className="text-xs text-ink-faint">Швидко додати матеріал у довідник</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              placeholder="Марка металу"
              disabled={loading || addingMaterial}
              className="min-w-[8rem] flex-1 rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <IsoGroupBadge category={newMaterialCategory} />
            <select
              value={newMaterialCategory}
              onChange={(e) => {
                const next = e.target.value as MaterialCategory
                setNewMaterialCategory(next)
                setNewMaterialColor(MATERIAL_CATEGORY_DEFAULT_COLORS[next])
              }}
              disabled={loading || addingMaterial}
              className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              {MATERIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {materialGroupTitle(c)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={loading || addingMaterial || !newMaterialName.trim()}
              onClick={() => void handleAddMaterial()}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-ink transition hover:border-accent/50 disabled:opacity-50"
            >
              Додати
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-muted">Тип заготовки</span>
          <select
            value={form.workpieceTypeId ?? ''}
            onChange={(e) =>
              setField('workpieceTypeId', e.target.value ? Number(e.target.value) : null)
            }
            disabled={loading}
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent"
          >
            <option value="">— не вибрано —</option>
            {workpieceTypes.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-white/10 p-3">
          <p className="text-xs text-ink-faint">Швидко додати тип заготовки</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={newWorkpieceName}
              onChange={(e) => setNewWorkpieceName(e.target.value)}
              placeholder="Назва типу"
              disabled={loading || addingWorkpiece}
              className="min-w-[8rem] flex-1 rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              type="button"
              disabled={loading || addingWorkpiece || !newWorkpieceName.trim()}
              onClick={() => void handleAddWorkpiece()}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-ink transition hover:border-accent/50 disabled:opacity-50"
            >
              Додати
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-muted">Примітки</span>
          <textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            rows={3}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface-raised/50 p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-faint">Фото</h2>
        {form.photoPaths.length === 0 ? (
          <p className="text-sm text-ink-faint">Фото ще не вибрано</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {form.photoPaths.map((path, index) => {
              const src = mediaUrl(path)
              return (
                <li key={`${path}-${index}`} className="relative">
                  {src ? (
                    <img src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-surface-overlay text-xs text-ink-faint">
                      ?
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removePhoto(index)}
                    className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-2 py-1 text-xs text-white"
                  >
                    Прибрати
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={() => void handlePickPhoto()}
          className="self-start rounded-lg border border-white/15 px-4 py-2 text-sm text-ink transition hover:border-accent/50 disabled:opacity-50"
        >
          Додати фото
        </button>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-ink disabled:opacity-50"
        >
          Скасувати
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'Збереження…' : 'Зберегти'}
        </button>
      </div>
    </form>
  )
}

function toFormState(part?: PartDetail | null): FormState {
  return {
    code: part?.code ?? '',
    name: part?.name ?? '',
    materialId: part?.materialId ?? null,
    workpieceTypeId: part?.workpieceTypeId ?? null,
    notes: part?.notes ?? '',
    photoPaths: part?.photoPaths ?? []
  }
}
