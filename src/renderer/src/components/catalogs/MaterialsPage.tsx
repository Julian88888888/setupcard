import { useEffect, useState } from 'react'
import type { Material, MaterialCategory } from '../../../../shared/schemas'
import { MATERIAL_CATEGORIES, MATERIAL_CATEGORY_LABELS } from './labels'

export function MaterialsPage(): JSX.Element {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<MaterialCategory>('other')
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
      await window.api.materials.create({ name: trimmed, category, notes: '' })
      setName('')
      setCategory('other')
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
          Довідник марок. Категорія потрібна для майбутньої перевірки сумісності з інструментами.
        </p>
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
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва марки"
            disabled={loading}
            className="min-w-[10rem] flex-1 rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MaterialCategory)}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {MATERIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {MATERIAL_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
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
          <li key={m.id} className="flex flex-wrap items-center gap-2 bg-surface-raised/40 px-4 py-3 text-sm">
            {editing?.id === m.id ? (
              <>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="min-w-[8rem] flex-1 rounded border border-white/15 bg-surface-overlay px-2 py-1.5 text-ink"
                />
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as MaterialCategory })
                  }
                  className="rounded border border-white/15 bg-surface-overlay px-2 py-1.5 text-ink"
                >
                  {MATERIAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {MATERIAL_CATEGORY_LABELS[c]}
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
                <span className="min-w-0 flex-1 truncate text-ink">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-ink-faint"> · </span>
                  <span className="text-ink-muted">{MATERIAL_CATEGORY_LABELS[m.category]}</span>
                </span>
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
