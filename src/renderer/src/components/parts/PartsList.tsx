import type { PartListItem } from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'
import { IsoGroupBadge } from '../catalogs/IsoGroupBadge'

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
          {parts.map((part) => {
            const thumb = mediaUrl(part.photoPaths[0])
            return (
              <li key={part.id}>
                <button
                  type="button"
                  onClick={() => onOpen(part.id)}
                  className="flex w-full gap-4 rounded-xl border border-white/10 bg-surface-raised/40 p-4 text-left transition hover:border-accent/40 hover:bg-surface-raised/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-overlay text-xs text-ink-faint">
                      фото
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-ink">{part.code}</p>
                    <p className="mt-0.5 truncate text-base font-semibold text-ink">{part.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                      {part.materialCategory ? (
                        <>
                          <IsoGroupBadge category={part.materialCategory} showFullLabel />
                          {part.materialName && (
                            <span className="text-ink">{part.materialName}</span>
                          )}
                        </>
                      ) : (
                        <span>матеріал не вказано</span>
                      )}
                    </p>
                    {part.workpieceTypeName && (
                      <p className="mt-1 text-xs text-ink-faint">Заготовка: {part.workpieceTypeName}</p>
                    )}
                  </div>
                  <span className="shrink-0 self-center text-xs text-accent">Детальніше →</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
