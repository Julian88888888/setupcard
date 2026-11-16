import type { PartDetail } from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'

interface PartDetailsProps {
  part: PartDetail
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : '—'
}

export function PartDetails({ part, onBack, onEdit, onDelete }: PartDetailsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-sm text-ink-muted transition hover:text-ink"
          >
            ← До списку
          </button>
          <p className="font-mono text-sm text-accent">{part.code}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{part.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Верстат: {part.machineName ?? 'не вибрано'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            Редагувати
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-950/50"
          >
            Видалити
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Матеріал" value={dash(part.material)} />
        <InfoCard label="Тип заготовки" value={dash(part.workpieceType)} />
        <InfoCard label="Приспособ" value={String(part.fixtures.length)} />
        <InfoCard label="Переходів" value={String(part.transitions.length)} />
      </section>

      {part.notes.trim() && (
        <section className="rounded-xl border border-white/10 bg-surface-raised/50 p-4">
          <h2 className="text-sm font-medium text-ink-muted">Примітки</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{part.notes}</p>
        </section>
      )}

      {part.machineId != null && (
        <section className="rounded-xl border border-white/10 bg-surface-raised/40 p-4">
          <h2 className="text-lg font-semibold text-ink">Програма</h2>
          {part.program ? (
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-faint">Назва</dt>
                <dd className="mt-1 text-sm text-ink">{dash(part.program.name)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-faint">Номер програми</dt>
                <dd className="mt-1 text-sm text-ink">{dash(part.program.programNumber)}</dd>
              </div>
              {part.program.notes.trim() && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink-faint">Примітки</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{part.program.notes}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">Програму не вказано</p>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-ink">Приспособи</h2>
        {part.fixtures.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Немає приспособ</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {part.fixtures.map((fixture) => (
              <li
                key={fixture.id}
                className="rounded-xl border border-white/10 bg-surface-raised/40 p-4"
              >
                <h3 className="font-medium text-ink">{fixture.name}</h3>
                {fixture.description.trim() && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">
                    {fixture.description}
                  </p>
                )}
                {fixture.notes.trim() && (
                  <p className="mt-1 text-sm text-ink-faint">{fixture.notes}</p>
                )}
                {fixture.photoPaths.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fixture.photoPaths.map((path) => {
                      const src = mediaUrl(path)
                      return src ? (
                        <img
                          key={path}
                          src={src}
                          alt=""
                          className="size-20 rounded-lg border border-white/10 object-cover"
                        />
                      ) : null
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink">Переходи</h2>
        {part.transitions.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Немає переходів</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {part.transitions.map((step) => {
              const photo = mediaUrl(step.photoPath)
              return (
                <li
                  key={step.id}
                  className="grid gap-4 rounded-xl border border-white/10 bg-surface-raised/40 p-4 lg:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <p className="text-xs text-ink-faint">Перехід {step.stepNumber}</p>
                    <h3 className="mt-1 font-medium text-ink">{step.name}</h3>
                    {step.description.trim() && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border border-white/5 bg-surface-overlay/50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                      Інструментальна збірка
                    </p>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div>
                        <dt className="inline text-ink-faint">Назва: </dt>
                        <dd className="inline text-ink">{dash(step.toolAssembly.name)}</dd>
                      </div>
                      <div>
                        <dt className="inline text-ink-faint">Ø: </dt>
                        <dd className="inline text-ink">{dash(step.toolAssembly.diameter)}</dd>
                      </div>
                      <div>
                        <dt className="inline text-ink-faint">L: </dt>
                        <dd className="inline text-ink">{dash(step.toolAssembly.length)}</dd>
                      </div>
                      {step.toolAssembly.notes.trim() && (
                        <div>
                          <dt className="inline text-ink-faint">Примітки: </dt>
                          <dd className="inline text-ink">{step.toolAssembly.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  {photo && (
                    <img
                      src={photo}
                      alt=""
                      className="size-24 justify-self-start rounded-lg border border-white/10 object-cover lg:justify-self-end"
                    />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-raised/50 px-3 py-2.5">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  )
}
