import { useEffect, useState } from 'react'
import type { WorkpieceType } from '../../../../shared/schemas'

export function WorkpieceTypesPage(): JSX.Element {
  const [items, setItems] = useState<WorkpieceType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [editing, setEditing] = useState<WorkpieceType | null>(null)

  const reload = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      setItems(await window.api.workpieceTypes.list())
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
      await window.api.workpieceTypes.create({ name: trimmed, notes: '' })
      setName('')
      setMessage('Тип заготовки додано')
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
      await window.api.workpieceTypes.update({
        id: editing.id,
        name: editing.name.trim(),
        notes: editing.notes
      })
      setEditing(null)
      setMessage('Тип заготовки оновлено')
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
      await window.api.workpieceTypes.delete(id)
      setMessage('Тип заготовки видалено')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Типи заготовок</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Довідник видів заготовок (пруток, лист, поковка тощо).
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
          Додати тип
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва типу"
            disabled={loading}
            className="min-w-[10rem] flex-1 rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
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
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-2 bg-surface-raised/40 px-4 py-3 text-sm"
          >
            {editing?.id === item.id ? (
              <>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="min-w-[8rem] flex-1 rounded border border-white/15 bg-surface-overlay px-2 py-1.5 text-ink"
                />
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
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.name}</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setEditing(item)}
                  className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-1.5 text-sm font-medium text-ink transition hover:border-accent/50 disabled:opacity-50"
                >
                  Змінити
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void remove(item.id)}
                  className="rounded-lg bg-red-600/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  Видалити
                </button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && !loading && (
          <li className="px-4 py-10 text-center text-ink-faint">Список порожній</li>
        )}
        {loading && items.length === 0 && (
          <li className="px-4 py-10 text-center text-ink-muted">Завантаження…</li>
        )}
      </ul>
    </div>
  )
}
