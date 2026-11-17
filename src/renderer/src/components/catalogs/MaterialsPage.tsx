import { useEffect, useState } from 'react'
import type { Material, MaterialCategory } from '../../../../shared/schemas'
import { IsoGroupBadge } from './IsoGroupBadge'
import {
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_DEFAULT_COLORS,
  MATERIAL_CATEGORY_LABELS,
  materialGroupTitle
} from './labels'

export function MaterialsPage(): JSX.Element {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<MaterialCategory>('P')
  const [editing, setEditing] = useState<Material | null>(null)

  const reload = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      setMaterials(await window.api.materials.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const create = async (): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      await window.api.materials.create({
        name: trimmed,
        category,
        color: MATERIAL_CATEGORY_DEFAULT_COLORS[category],
        notes: ''
      })
      setName('')
      setCategory('P')
      setMessage('Матеріал додано')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }

  const save = async (): Promise<void> => {
    if (!editing) return
    setLoading(true)
    setError(null)
    try {
      await window.api.materials.update({
        id: editing.id,
        name: editing.name.trim(),
        category: editing.category,
        color: MATERIAL_CATEGORY_DEFAULT_COLORS[editing.category],
        notes: editing.notes
      })
      setEditing(null)
      setMessage('Матеріал оновлено')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }

  const remove = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await window.api.materials.delete(id)
      setMessage('Матеріал видалено')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Матеріали</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Група обробки ISO 513 задає колір (як на упаковці). Марка — окрема назва металу.
        </p>

        {/* Легенда як на упаковці: ряд кольорових квадратів */}
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-surface-raised/60">
          <div className="grid grid-cols-6">
            {MATERIAL_CATEGORIES.map((c) => (
              <div
                key={c}
                className="flex flex-col items-center gap-1 border-r border-black/10 px-1 py-3 last:border-r-0"
                style={{ backgroundColor: MATERIAL_CATEGORY_DEFAULT_COLORS[c] }}
              >
                <span
                  className="text-lg font-bold leading-none"
                  style={{
                    color: c === 'M' ? '#1A1A1A' : '#FFFFFF'
                  }}
                >
                  {c}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1 border-t border-white/10 bg-surface-overlay/80 px-1 py-2 text-center text-[10px] leading-tight text-ink-muted sm:text-xs">
            {MATERIAL_CATEGORIES.map((c) => (
              <span key={c}>{MATERIAL_CATEGORY_LABELS[c]}</span>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-accent/30 bg-accent-soft/30 px-3 py-2 text-sm text-ink">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-white/10 bg-surface-raised/50 p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-faint">
          Додати матеріал
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Марка металу</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр. Сталь 45, Д16Т, 40Х"
              disabled={loading}
              className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex min-w-[12rem] flex-col gap-1.5">
            <span className="text-sm text-ink-muted">Група ISO</span>
            <div className="flex items-center gap-2">
              <IsoGroupBadge category={category} size="md" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                disabled={loading}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                {MATERIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {materialGroupTitle(c)}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <button
            type="button"
            disabled={loading || !name.trim()}
            onClick={() => void create()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Додати
          </button>
        </div>
      </section>

      <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
        {materials.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center gap-3 bg-surface-raised/40 px-4 py-3 text-sm"
          >
            {editing?.id === m.id ? (
              <>
                <IsoGroupBadge category={editing.category} size="md" />
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="min-w-[8rem] flex-1 rounded-lg border border-white/15 bg-surface-overlay px-3 py-1.5 text-ink"
                  placeholder="Марка металу"
                />
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as MaterialCategory,
                      color: MATERIAL_CATEGORY_DEFAULT_COLORS[e.target.value as MaterialCategory]
                    })
                  }
                  className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-1.5 text-ink"
                >
                  {MATERIAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {materialGroupTitle(c)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void save()}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
                >
                  Зберегти
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-1.5 text-sm font-medium text-ink transition hover:border-white/30"
                >
                  Скасувати
                </button>
              </>
            ) : (
              <>
                <IsoGroupBadge category={m.category} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{m.name}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {materialGroupTitle(m.category)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setEditing(m)}
                  className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-1.5 text-sm font-medium text-ink transition hover:border-accent/50 disabled:opacity-50"
                >
                  Змінити
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void remove(m.id)}
                  className="rounded-lg bg-red-600/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  Видалити
                </button>
              </>
            )}
          </li>
        ))}
        {materials.length === 0 && !loading && (
          <li className="px-4 py-10 text-center text-ink-faint">Список порожній</li>
        )}
        {loading && materials.length === 0 && (
          <li className="px-4 py-10 text-center text-ink-muted">Завантаження…</li>
        )}
      </ul>
    </div>
  )
}
