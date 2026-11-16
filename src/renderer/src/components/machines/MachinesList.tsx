import type { Machine } from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'

interface MachinesListProps {
  machines: Machine[]
  loading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onAdd: () => void
  onOpen: (machine: Machine) => void
}

function preview(value: string | null | undefined, max = 80): string {
  if (!value?.trim()) return '—'
  const text = value.trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function MachinesList({
  machines,
  loading,
  searchQuery,
  onSearchChange,
  onAdd,
  onOpen
}: MachinesListProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Верстати</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {loading ? 'Завантаження…' : `Усього: ${machines.length}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
        >
          Додати верстат
        </button>
      </header>

      <label className="block max-w-xl">
        <span className="sr-only">Пошук</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Пошук за назвою або інвентарним номером…"
          className="w-full rounded-lg border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
        />
      </label>

      {machines.length === 0 && !loading ? (
        <div className="rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-ink-muted">
            {searchQuery.trim()
              ? 'Нічого не знайдено за вашим запитом'
              : 'Ще немає верстатів. Натисніть «Додати верстат».'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {machines.map((machine) => {
            const photo = mediaUrl(machine.photoPath)
            return (
              <li key={machine.id}>
                <button
                  type="button"
                  onClick={() => onOpen(machine)}
                  className="flex w-full gap-4 rounded-xl border border-white/10 bg-surface-raised/40 p-3 text-left transition hover:border-accent/40 hover:bg-surface-raised/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:p-4"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-overlay sm:size-24">
                    {photo ? (
                      <img
                        src={photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-ink-faint">
                        Немає фото
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="truncate text-base font-semibold text-ink sm:text-lg">
                        {machine.name}
                      </h2>
                      <span className="shrink-0 text-xs text-accent">Детальніше →</span>
                    </div>

                    <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-faint">Інв. №</dt>
                        <dd className="truncate text-ink-muted">{machine.inventoryNumber}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-faint">ЧПК</dt>
                        <dd className="truncate text-ink-muted">
                          {preview(machine.controlSystemType, 40)}
                        </dd>
                      </div>
                      <div className="flex gap-2 sm:col-span-2">
                        <dt className="shrink-0 text-ink-faint">Тип</dt>
                        <dd className="line-clamp-2 text-ink-muted">
                          {preview(machine.machineType, 120)}
                        </dd>
                      </div>
                      {(machine.spindleTaper || machine.maxSpindleSpeed) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-ink-muted sm:col-span-2">
                          {machine.spindleTaper && (
                            <span>
                              <span className="text-ink-faint">Конус: </span>
                              {machine.spindleTaper}
                            </span>
                          )}
                          {machine.maxSpindleSpeed != null && (
                            <span>
                              <span className="text-ink-faint">Оберти: </span>
                              {machine.maxSpindleSpeed} об/хв
                            </span>
                          )}
                        </div>
                      )}
                    </dl>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
