import type { PartListItem } from '../../../../shared/schemas'

interface PartsListProps {
  parts: PartListItem[]
  loading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onAdd: () => void
  onOpen: (id: number) => void
}

export function PartsList({
  parts,
  loading,
  searchQuery,
  onSearchChange,
  onAdd,
  onOpen
}: PartsListProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Деталі</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {loading ? 'Завантаження…' : `Усього: ${parts.length}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
        >
          Додати деталь
        </button>
      </header>

      <label className="block max-w-xl">
        <span className="sr-only">Пошук</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Пошук за кодом, назвою або матеріалом…"
          className="w-full rounded-lg border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
        />
      </label>

      {parts.length === 0 && !loading ? (
        <div className="rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-ink-muted">
            {searchQuery.trim()
              ? 'Нічого не знайдено за вашим запитом'
              : 'Ще немає деталей. Натисніть «Додати деталь».'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {parts.map((part) => (
            <li key={part.id}>
              <button
                type="button"
                onClick={() => onOpen(part.id)}
                className="flex w-full flex-col gap-2 rounded-xl border border-white/10 bg-surface-raised/40 p-4 text-left transition hover:border-accent/40 hover:bg-surface-raised/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-sm text-accent">{part.code}</span>
                    <h2 className="truncate text-base font-semibold text-ink">{part.name}</h2>
                  </div>
                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    <div>
                      <dt className="inline text-ink-faint">Матеріал: </dt>
                      <dd className="inline">{part.material || '—'}</dd>
                    </div>
                    <div>
                      <dt className="inline text-ink-faint">Заготовка: </dt>
                      <dd className="inline">{part.workpieceType || '—'}</dd>
                    </div>
                    <div>
                      <dt className="inline text-ink-faint">Верстат: </dt>
                      <dd className="inline">{part.machineName || 'не вибрано'}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-ink-faint">
                  <span>{part.fixtureCount} приспос.</span>
                  <span>{part.transitionCount} переходів</span>
                  <span className="text-accent">Детальніше →</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
