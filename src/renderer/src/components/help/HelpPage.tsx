import { useMemo, useState } from 'react'
import { IsoGroupBadge } from '../catalogs/IsoGroupBadge'
import type { MaterialCategory } from '../../../../shared/schemas'
import { HELP_SECTIONS, type HelpBlock, type HelpSection } from './content'

export function HelpPage(): JSX.Element {
  const [search, setSearch] = useState('')

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return HELP_SECTIONS
    return HELP_SECTIONS.map((section) => {
      if (sectionMatches(section, q)) return section
      const blocks = section.blocks.filter((b) => blockMatches(b, q))
      if (blocks.length === 0) return null
      return { ...section, blocks }
    }).filter((s): s is HelpSection => s != null)
  }, [search])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Довідка</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Пояснення по модулях, ISO-групах, фото та резервних копіях. Значення можна доповнювати в
          коді.
        </p>
      </header>

      <label className="block">
        <span className="sr-only">Пошук у довідці</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук у довідці…"
          className="w-full rounded-lg border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
        />
      </label>

      <nav
        aria-label="Розділи довідки"
        className="flex flex-wrap gap-2 border-b border-white/10 pb-4"
      >
        {HELP_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#help-${s.id}`}
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-1.5 text-xs text-ink-muted transition hover:border-accent/40 hover:text-ink"
          >
            {s.title}
          </a>
        ))}
      </nav>

      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-ink-faint">
          Нічого не знайдено
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.id} id={`help-${section.id}`} className="scroll-mt-6">
              <h2 className="text-lg font-semibold tracking-tight text-ink">{section.title}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.blocks.map((block, index) => (
                  <HelpBlockView key={`${section.id}-${index}`} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function HelpBlockView({ block }: { block: HelpBlock }): JSX.Element {
  if (block.type === 'paragraph') {
    return <p className="text-sm leading-relaxed text-ink-muted">{block.text}</p>
  }

  if (block.type === 'note') {
    return (
      <p className="rounded-lg border border-accent/25 bg-accent-soft/20 px-3 py-2 text-sm text-ink">
        {block.text}
      </p>
    )
  }

  if (block.type === 'bullets') {
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  const isIsoTable = block.headers[0] === 'Код' && block.headers[1] === 'Назва'

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[20rem] text-left text-sm">
        <thead className="bg-surface-overlay/80 text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            {block.headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-surface-raised/40">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 text-ink">
                  {isIsoTable && cellIndex === 0 && isMaterialCategory(cell) ? (
                    <IsoGroupBadge category={cell} />
                  ) : cellIndex === 2 && isIsoTable && cell.startsWith('#') ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-4 rounded border border-white/20"
                        style={{ backgroundColor: cell }}
                      />
                      <span className="font-mono text-xs text-ink-muted">{cell}</span>
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function isMaterialCategory(value: string): value is MaterialCategory {
  return ['P', 'M', 'K', 'N', 'S', 'H'].includes(value)
}

function sectionMatches(section: HelpSection, q: string): boolean {
  if (section.title.toLowerCase().includes(q)) return true
  return section.blocks.some((b) => blockMatches(b, q))
}

function blockMatches(block: HelpBlock, q: string): boolean {
  if (block.type === 'paragraph' || block.type === 'note') {
    return block.text.toLowerCase().includes(q)
  }
  if (block.type === 'bullets') {
    return block.items.some((item) => item.toLowerCase().includes(q))
  }
  return (
    block.headers.some((h) => h.toLowerCase().includes(q)) ||
    block.rows.some((row) => row.some((cell) => cell.toLowerCase().includes(q)))
  )
}
