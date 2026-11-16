import { useAppStore, type AppSection } from '../../store/useAppStore'

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: 'machines', label: 'Верстати' },
  { id: 'parts', label: 'Деталі' },
  { id: 'settings', label: 'Налаштування' }
]

export function Sidebar(): JSX.Element {
  const section = useAppStore((s) => s.section)
  const setSection = useAppStore((s) => s.setSection)

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-surface-raised/60 backdrop-blur">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">SetupCard</p>
        <p className="mt-2 text-sm text-ink-muted">Облік виробництва</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Головне меню">
        {NAV_ITEMS.map((item) => {
          const active = section === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={[
                'rounded-lg px-3 py-2.5 text-left text-sm font-medium transition',
                active
                  ? 'bg-accent/20 text-ink ring-1 ring-accent/40'
                  : 'text-ink-muted hover:bg-white/5 hover:text-ink'
              ].join(' ')}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
