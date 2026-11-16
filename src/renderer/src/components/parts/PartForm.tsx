import { useEffect, useState, type FormEvent } from 'react'
import type {
  Machine,
  PartCreate,
  PartDetail,
  PartFixtureInput,
  PartProgramInput,
  PartTransitionInput
} from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'

interface PartFormProps {
  mode: 'create' | 'edit'
  initial?: PartDetail | null
  loading: boolean
  error: string | null
  onSubmit: (data: PartCreate) => Promise<void>
  onCancel: () => void
  onPickFixturePhoto: () => Promise<string | null>
  onPickTransitionPhoto: () => Promise<string | null>
}

type FixtureDraft = PartFixtureInput & { key: string }
type TransitionDraft = PartTransitionInput & { key: string }

const TRANSITION_PRESETS = ['Центровка', 'Свердління', 'Фрезерування', 'Розточування', 'Нарізання різьби']

function newKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyProgram(): PartProgramInput {
  return { name: '', programNumber: '', notes: '' }
}

function emptyFixture(): FixtureDraft {
  return { key: newKey(), name: '', description: '', notes: '', photoPaths: [] }
}

function emptyTransition(stepNumber: number): TransitionDraft {
  return {
    key: newKey(),
    stepNumber,
    name: '',
    description: '',
    toolAssembly: { name: '', diameter: '', length: '', notes: '' },
    photoPath: null,
    sortOrder: stepNumber - 1
  }
}

export function PartForm({
  mode,
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
  onPickFixturePhoto,
  onPickTransitionPhoto
}: PartFormProps): JSX.Element {
  const [machines, setMachines] = useState<Machine[]>([])
  const [code, setCode] = useState(initial?.code ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [material, setMaterial] = useState(initial?.material ?? '')
  const [workpieceType, setWorkpieceType] = useState(initial?.workpieceType ?? '')
  const [machineId, setMachineId] = useState<number | null>(initial?.machineId ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [program, setProgram] = useState<PartProgramInput>(
    initial?.program
      ? {
          name: initial.program.name,
          programNumber: initial.program.programNumber,
          notes: initial.program.notes
        }
      : emptyProgram()
  )
  const [fixtures, setFixtures] = useState<FixtureDraft[]>(
    initial?.fixtures.map((f) => ({
      key: newKey(),
      name: f.name,
      description: f.description,
      notes: f.notes,
      photoPaths: [...f.photoPaths]
    })) ?? []
  )
  const [transitions, setTransitions] = useState<TransitionDraft[]>(
    initial?.transitions.map((t, index) => ({
      key: newKey(),
      stepNumber: t.stepNumber,
      name: t.name,
      description: t.description,
      toolAssembly: { ...t.toolAssembly },
      photoPath: t.photoPath,
      sortOrder: t.sortOrder ?? index
    })) ?? []
  )
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    void window.api.machines.list('').then(setMachines)
  }, [])

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setLocalError(null)

    if (!code.trim() || !name.trim()) {
      setLocalError('Код і назва деталі обов’язкові')
      return
    }

    for (const fixture of fixtures) {
      if (!fixture.name.trim()) {
        setLocalError('У кожної приспособи має бути назва')
        return
      }
    }

    for (const step of transitions) {
      if (!step.name.trim()) {
        setLocalError('У кожного переходу має бути назва')
        return
      }
    }

    const payload: PartCreate = {
      code: code.trim(),
      name: name.trim(),
      material: material.trim(),
      workpieceType: workpieceType.trim(),
      machineId,
      notes: notes.trim(),
      program:
        machineId != null
          ? {
              name: program.name.trim(),
              programNumber: program.programNumber.trim(),
              notes: program.notes.trim()
            }
          : null,
      fixtures: fixtures.map((f) => ({
        name: f.name.trim(),
        description: f.description.trim(),
        notes: f.notes.trim(),
        photoPaths: f.photoPaths
      })),
      transitions: transitions.map((t, index) => ({
        stepNumber: t.stepNumber || index + 1,
        name: t.name.trim(),
        description: t.description.trim(),
        toolAssembly: {
          name: t.toolAssembly?.name?.trim() ?? '',
          diameter: t.toolAssembly?.diameter?.trim() ?? '',
          length: t.toolAssembly?.length?.trim() ?? '',
          notes: t.toolAssembly?.notes?.trim() ?? ''
        },
        photoPath: t.photoPath,
        sortOrder: index
      }))
    }

    await onSubmit(payload)
  }

  const updateFixture = (key: string, patch: Partial<FixtureDraft>): void => {
    setFixtures((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)))
  }

  const updateTransition = (key: string, patch: Partial<TransitionDraft>): void => {
    setTransitions((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)))
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {mode === 'create' ? 'Нова деталь' : 'Редагування деталі'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Базові дані, верстат, програма, приспособи та переходи
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-white/15 bg-surface-overlay px-4 py-2 text-sm font-medium text-ink transition hover:border-white/30 disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            Зберегти
          </button>
        </div>
      </header>

      {(localError || error) && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {localError || error}
        </p>
      )}

      {/* 1. Basic fields */}
      <section className="rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-ink">1. Основні дані</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Код деталі *" value={code} disabled={loading} onChange={setCode} />
          <Field label="Назва *" value={name} disabled={loading} onChange={setName} />
          <Field label="Матеріал" value={material} disabled={loading} onChange={setMaterial} />
          <Field
            label="Тип заготовки"
            value={workpieceType}
            disabled={loading}
            onChange={setWorkpieceType}
          />
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm text-ink-muted">Примітки</span>
            <textarea
              rows={3}
              disabled={loading}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
            />
          </label>
        </div>
      </section>

      {/* 2. Machine */}
      <section className="rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-ink">2. Верстат</h2>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-sm text-ink-muted">Оберіть верстат зі списку</span>
          <select
            disabled={loading}
            value={machineId ?? ''}
            onChange={(e) => {
              const value = e.target.value
              setMachineId(value ? Number(value) : null)
            }}
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
          >
            <option value="">— Не вибрано —</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.inventoryNumber})
              </option>
            ))}
          </select>
        </label>
        {machines.length === 0 && (
          <p className="mt-2 text-sm text-ink-faint">
            Спочатку додайте верстат у розділі «Верстати».
          </p>
        )}
      </section>

      {/* 3. Program — only after machine selected */}
      {machineId != null && (
        <section className="rounded-xl border border-accent/20 bg-accent-soft/10 p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-ink">3. Програма</h2>
          <p className="mt-1 text-sm text-ink-muted">З’являється після вибору верстата</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Назва програми"
              value={program.name ?? ''}
              disabled={loading}
              onChange={(v) => setProgram((p) => ({ ...p, name: v }))}
            />
            <Field
              label="Номер програми"
              value={program.programNumber ?? ''}
              disabled={loading}
              onChange={(v) => setProgram((p) => ({ ...p, programNumber: v }))}
            />
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm text-ink-muted">Примітки до програми</span>
              <textarea
                rows={2}
                disabled={loading}
                value={program.notes ?? ''}
                onChange={(e) => setProgram((p) => ({ ...p, notes: e.target.value }))}
                className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
              />
            </label>
          </div>
        </section>
      )}

      {/* 4. Fixtures */}
      <section className="rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">4. Приспособи</h2>
            <p className="mt-1 text-sm text-ink-muted">Можна додати кілька з фото</p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => setFixtures((prev) => [...prev, emptyFixture()])}
            className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-2 text-sm text-ink transition hover:border-accent/50 disabled:opacity-50"
          >
            + Додати приспособу
          </button>
        </div>

        {fixtures.length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">Приспособ ще немає</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {fixtures.map((fixture, index) => (
              <li
                key={fixture.key}
                className="rounded-lg border border-white/10 bg-surface-overlay/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-ink">Приспособа {index + 1}</h3>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setFixtures((prev) => prev.filter((f) => f.key !== fixture.key))}
                    className="text-xs text-red-300 hover:text-red-200 disabled:opacity-50"
                  >
                    Видалити
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Назва *"
                    value={fixture.name}
                    disabled={loading}
                    onChange={(v) => updateFixture(fixture.key, { name: v })}
                  />
                  <Field
                    label="Примітки"
                    value={fixture.notes ?? ''}
                    disabled={loading}
                    onChange={(v) => updateFixture(fixture.key, { notes: v })}
                  />
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-sm text-ink-muted">Опис</span>
                    <textarea
                      rows={2}
                      disabled={loading}
                      value={fixture.description ?? ''}
                      onChange={(e) =>
                        updateFixture(fixture.key, { description: e.target.value })
                      }
                      className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
                    />
                  </label>
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        void onPickFixturePhoto().then((path) => {
                          if (!path) return
                          updateFixture(fixture.key, {
                            photoPaths: [...(fixture.photoPaths ?? []), path]
                          })
                        })
                      }}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-ink transition hover:border-accent/50 disabled:opacity-50"
                    >
                      Додати фото
                    </button>
                  </div>
                  {(fixture.photoPaths?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fixture.photoPaths.map((path) => {
                        const src = mediaUrl(path)
                        return (
                          <div key={path} className="relative">
                            {src && (
                              <img
                                src={src}
                                alt=""
                                className="size-16 rounded-md border border-white/10 object-cover"
                              />
                            )}
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                updateFixture(fixture.key, {
                                  photoPaths: fixture.photoPaths.filter((p) => p !== path)
                                })
                              }
                              className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] text-white"
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5. Transitions */}
      <section className="rounded-xl border border-white/10 bg-surface-raised/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">5. Переходи</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Кроки обробки з інструментальною збіркою поруч
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setTransitions((prev) => [...prev, emptyTransition(prev.length + 1)])
            }
            className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-2 text-sm text-ink transition hover:border-accent/50 disabled:opacity-50"
          >
            + Додати перехід
          </button>
        </div>

        {transitions.length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">Переходів ще немає</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {transitions.map((step, index) => {
              const photo = mediaUrl(step.photoPath)
              return (
                <li
                  key={step.key}
                  className="rounded-lg border border-white/10 bg-surface-overlay/40 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-ink">Перехід {index + 1}</h3>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        setTransitions((prev) =>
                          prev
                            .filter((t) => t.key !== step.key)
                            .map((t, i) => ({
                              ...t,
                              stepNumber: i + 1,
                              sortOrder: i
                            }))
                        )
                      }
                      className="text-xs text-red-300 hover:text-red-200 disabled:opacity-50"
                    >
                      Видалити
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="grid gap-3">
                      <Field
                        label="Номер кроку"
                        value={String(step.stepNumber)}
                        disabled={loading}
                        onChange={(v) => {
                          const n = Number(v.replace(/\D/g, '')) || index + 1
                          updateTransition(step.key, { stepNumber: n })
                        }}
                      />
                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm text-ink-muted">Назва переходу *</span>
                        <input
                          list={`transition-presets-${step.key}`}
                          disabled={loading}
                          value={step.name}
                          onChange={(e) => updateTransition(step.key, { name: e.target.value })}
                          placeholder="наприклад: Центровка"
                          className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
                        />
                        <datalist id={`transition-presets-${step.key}`}>
                          {TRANSITION_PRESETS.map((preset) => (
                            <option key={preset} value={preset} />
                          ))}
                        </datalist>
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm text-ink-muted">Опис</span>
                        <textarea
                          rows={3}
                          disabled={loading}
                          value={step.description ?? ''}
                          onChange={(e) =>
                            updateTransition(step.key, { description: e.target.value })
                          }
                          className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
                        />
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            void onPickTransitionPhoto().then((path) => {
                              if (path) updateTransition(step.key, { photoPath: path })
                            })
                          }}
                          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-ink transition hover:border-accent/50 disabled:opacity-50"
                        >
                          {step.photoPath ? 'Змінити фото' : 'Додати фото'}
                        </button>
                        {step.photoPath && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => updateTransition(step.key, { photoPath: null })}
                            className="text-xs text-ink-muted hover:text-ink disabled:opacity-50"
                          >
                            Прибрати фото
                          </button>
                        )}
                        {photo && (
                          <img
                            src={photo}
                            alt=""
                            className="size-14 rounded-md border border-white/10 object-cover"
                          />
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-surface-raised/50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Інструментальна збірка
                      </p>
                      <div className="mt-3 grid gap-3">
                        <Field
                          label="Назва інструмента"
                          value={step.toolAssembly?.name ?? ''}
                          disabled={loading}
                          onChange={(v) =>
                            updateTransition(step.key, {
                              toolAssembly: { ...step.toolAssembly, name: v }
                            })
                          }
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Field
                            label="Діаметр"
                            value={step.toolAssembly?.diameter ?? ''}
                            disabled={loading}
                            onChange={(v) =>
                              updateTransition(step.key, {
                                toolAssembly: { ...step.toolAssembly, diameter: v }
                              })
                            }
                          />
                          <Field
                            label="Довжина"
                            value={step.toolAssembly?.length ?? ''}
                            disabled={loading}
                            onChange={(v) =>
                              updateTransition(step.key, {
                                toolAssembly: { ...step.toolAssembly, length: v }
                              })
                            }
                          />
                        </div>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm text-ink-muted">Примітки до збірки</span>
                          <textarea
                            rows={2}
                            disabled={loading}
                            value={step.toolAssembly?.notes ?? ''}
                            onChange={(e) =>
                              updateTransition(step.key, {
                                toolAssembly: {
                                  ...step.toolAssembly,
                                  notes: e.target.value
                                }
                              })
                            }
                            className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </form>
  )
}

function Field(props: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}): JSX.Element {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-ink-muted">{props.label}</span>
      <input
        type="text"
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
      />
    </label>
  )
}
