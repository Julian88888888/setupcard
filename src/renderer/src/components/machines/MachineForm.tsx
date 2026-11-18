import { useState, type FormEvent } from 'react'
import type { Machine, MachineCreate } from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'
import { MACHINE_LABELS } from './machineLabels'

interface MachineFormProps {
  mode: 'create' | 'edit'
  initial?: Machine | null
  loading: boolean
  error: string | null
  onSubmit: (data: MachineCreate) => Promise<void>
  onCancel: () => void
  onPickPhoto: () => Promise<string | null>
}

type FormState = {
  name: string
  inventoryNumber: string
  machineType: string
  controlSystemType: string
  spindleTaper: string
  maxSpindleSpeed: string
  magazineCapacity: string
  maxToolLength: string
  maxToolDiameter: string
  maxToolWeight: string
  tableSize: string
  axisTravel: string
  tableLoadCapacity: string
  maxWorkpieceSize: string
  numberOfTables: string
  photoPath: string | null
  notes: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

type NumberKind = 'int' | 'decimal'

type NumberFieldKey =
  | 'maxSpindleSpeed'
  | 'magazineCapacity'
  | 'maxToolWeight'
  | 'tableLoadCapacity'
  | 'numberOfTables'

const NUMBER_FIELDS: Array<{
  key: NumberFieldKey
  kind: NumberKind
  example: string
  unitHint: string
}> = [
  {
    key: 'maxSpindleSpeed',
    kind: 'int',
    example: '10000',
    unitHint: 'лише число без «об/хв»'
  },
  {
    key: 'magazineCapacity',
    kind: 'int',
    example: '24',
    unitHint: 'лише ціле число'
  },
  {
    key: 'maxToolWeight',
    kind: 'decimal',
    example: '15',
    unitHint: 'лише число без «кг»'
  },
  {
    key: 'tableLoadCapacity',
    kind: 'decimal',
    example: '500',
    unitHint: 'лише число без «кг»'
  },
  {
    key: 'numberOfTables',
    kind: 'int',
    example: '1',
    unitHint: 'лише ціле число'
  }
]

function toFormState(machine?: Machine | null): FormState {
  return {
    name: machine?.name ?? '',
    inventoryNumber: machine?.inventoryNumber ?? '',
    machineType: machine?.machineType ?? '',
    controlSystemType: machine?.controlSystemType ?? '',
    spindleTaper: machine?.spindleTaper ?? '',
    maxSpindleSpeed: numToInput(machine?.maxSpindleSpeed),
    magazineCapacity: numToInput(machine?.magazineCapacity),
    maxToolLength: machine?.maxToolLength ?? '',
    maxToolDiameter: machine?.maxToolDiameter ?? '',
    maxToolWeight: numToInput(machine?.maxToolWeight),
    tableSize: machine?.tableSize ?? '',
    axisTravel: machine?.axisTravel ?? '',
    tableLoadCapacity: numToInput(machine?.tableLoadCapacity),
    maxWorkpieceSize: machine?.maxWorkpieceSize ?? '',
    numberOfTables: numToInput(machine?.numberOfTables),
    photoPath: machine?.photoPath ?? null,
    notes: machine?.notes ?? ''
  }
}

function numToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

type ParseResult =
  | { ok: true; value: number | null }
  | { ok: false; message: string }

function parseNumberField(
  raw: string,
  kind: NumberKind,
  label: string,
  example: string,
  unitHint: string
): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: true, value: null }
  }

  // Allow Ukrainian decimal comma: 12,5
  const normalized = trimmed.replace(/\s+/g, '').replace(',', '.')

  if (kind === 'int') {
    if (!/^\d+$/.test(normalized)) {
      return {
        ok: false,
        message: `«${label}»: введіть ${unitHint}, наприклад ${example} (не «${trimmed}»)`
      }
    }
    const n = Number(normalized)
    if (!Number.isFinite(n) || n < 0) {
      return {
        ok: false,
        message: `«${label}»: значення має бути невід’ємним цілим числом, наприклад ${example}`
      }
    }
    return { ok: true, value: n }
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return {
      ok: false,
      message: `«${label}»: введіть ${unitHint}, наприклад ${example} (не «${trimmed}»)`
    }
  }
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) {
    return {
      ok: false,
      message: `«${label}»: значення має бути невід’ємним числом, наприклад ${example}`
    }
  }
  return { ok: true, value: n }
}

export function MachineForm({
  mode,
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
  onPickPhoto
}: MachineFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handlePickPhoto = async (): Promise<void> => {
    const path = await onPickPhoto()
    if (path) {
      setField('photoPath', path)
    }
  }

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setLocalError(null)

    if (!form.name.trim() || !form.inventoryNumber.trim()) {
      setLocalError('Назва та інвентарний номер обов’язкові')
      return
    }

    const nextErrors: FieldErrors = {}
    const parsedNumbers: Partial<Record<NumberFieldKey, number | null>> = {}

    for (const field of NUMBER_FIELDS) {
      const result = parseNumberField(
        form[field.key],
        field.kind,
        MACHINE_LABELS[field.key],
        field.example,
        field.unitHint
      )
      if (!result.ok) {
        nextErrors[field.key] = result.message
      } else {
        parsedNumbers[field.key] = result.value
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setLocalError('Перевірте числові поля: одиниці вже вказані в назві поля — вводьте лише число.')
      return
    }

    setFieldErrors({})

    const payload: MachineCreate = {
      name: form.name.trim(),
      inventoryNumber: form.inventoryNumber.trim(),
      machineType: form.machineType.trim(),
      controlSystemType: form.controlSystemType.trim(),
      spindleTaper: form.spindleTaper.trim(),
      maxSpindleSpeed: parsedNumbers.maxSpindleSpeed ?? null,
      magazineCapacity: parsedNumbers.magazineCapacity ?? null,
      maxToolLength: form.maxToolLength.trim(),
      maxToolDiameter: form.maxToolDiameter.trim(),
      maxToolWeight: parsedNumbers.maxToolWeight ?? null,
      tableSize: form.tableSize.trim(),
      axisTravel: form.axisTravel.trim(),
      tableLoadCapacity: parsedNumbers.tableLoadCapacity ?? null,
      maxWorkpieceSize: form.maxWorkpieceSize.trim(),
      numberOfTables: parsedNumbers.numberOfTables ?? null,
      photoPath: form.photoPath,
      notes: form.notes.trim()
    }

    await onSubmit(payload)
  }

  const photoSrc = mediaUrl(form.photoPath)
  const numberMeta = Object.fromEntries(NUMBER_FIELDS.map((f) => [f.key, f])) as Record<
    NumberFieldKey,
    (typeof NUMBER_FIELDS)[number]
  >

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {mode === 'create' ? 'Новий верстат' : 'Редагування верстата'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            У числових полях вводьте лише значення (наприклад 10000), без одиниць виміру
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

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <section className="flex flex-col gap-3">
          <span className="text-sm text-ink-muted">{MACHINE_LABELS.photo}</span>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-overlay">
            {photoSrc ? (
              <img src={photoSrc} alt="Фото верстата" className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-sm text-ink-faint">Немає фото</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => void handlePickPhoto()}
              className="rounded-lg border border-white/15 bg-surface-overlay px-3 py-2 text-sm text-ink transition hover:border-accent/50 disabled:opacity-50"
            >
              {form.photoPath ? 'Змінити фото' : 'Завантажити фото'}
            </button>
            {form.photoPath && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setField('photoPath', null)}
                className="rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:text-ink disabled:opacity-50"
              >
                Прибрати фото
              </button>
            )}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={MACHINE_LABELS.name}
            value={form.name}
            required
            disabled={loading}
            onChange={(v) => setField('name', v)}
          />
          <TextField
            label={MACHINE_LABELS.inventoryNumber}
            value={form.inventoryNumber}
            required
            disabled={loading}
            onChange={(v) => setField('inventoryNumber', v)}
          />
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm text-ink-muted">{MACHINE_LABELS.machineType}</span>
            <textarea
              rows={3}
              disabled={loading}
              value={form.machineType}
              onChange={(e) => setField('machineType', e.target.value)}
              className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
            />
          </label>
          <TextField
            label={MACHINE_LABELS.controlSystemType}
            value={form.controlSystemType}
            disabled={loading}
            onChange={(v) => setField('controlSystemType', v)}
          />
          <TextField
            label={MACHINE_LABELS.spindleTaper}
            value={form.spindleTaper}
            disabled={loading}
            onChange={(v) => setField('spindleTaper', v)}
          />

          <NumberField
            label={MACHINE_LABELS.maxSpindleSpeed}
            value={form.maxSpindleSpeed}
            example={numberMeta.maxSpindleSpeed.example}
            hint={numberMeta.maxSpindleSpeed.unitHint}
            error={fieldErrors.maxSpindleSpeed}
            inputMode="numeric"
            disabled={loading}
            onChange={(v) => setField('maxSpindleSpeed', v)}
          />
          <NumberField
            label={MACHINE_LABELS.magazineCapacity}
            value={form.magazineCapacity}
            example={numberMeta.magazineCapacity.example}
            hint={numberMeta.magazineCapacity.unitHint}
            error={fieldErrors.magazineCapacity}
            inputMode="numeric"
            disabled={loading}
            onChange={(v) => setField('magazineCapacity', v)}
          />
          <TextField
            label={MACHINE_LABELS.maxToolLength}
            value={form.maxToolLength}
            placeholder="наприклад: 630/(700)"
            hint="можна вказувати формат 630/(700)"
            disabled={loading}
            onChange={(v) => setField('maxToolLength', v)}
          />
          <TextField
            label={MACHINE_LABELS.maxToolDiameter}
            value={form.maxToolDiameter}
            placeholder="наприклад: 125/(320)"
            hint="можна вказувати формат 125/(320)"
            disabled={loading}
            onChange={(v) => setField('maxToolDiameter', v)}
          />
          <NumberField
            label={MACHINE_LABELS.maxToolWeight}
            value={form.maxToolWeight}
            example={numberMeta.maxToolWeight.example}
            hint={numberMeta.maxToolWeight.unitHint}
            error={fieldErrors.maxToolWeight}
            inputMode="decimal"
            disabled={loading}
            onChange={(v) => setField('maxToolWeight', v)}
          />

          <TextField
            label={MACHINE_LABELS.tableSize}
            value={form.tableSize}
            disabled={loading}
            onChange={(v) => setField('tableSize', v)}
          />
          <TextField
            label={MACHINE_LABELS.axisTravel}
            value={form.axisTravel}
            disabled={loading}
            onChange={(v) => setField('axisTravel', v)}
          />

          <NumberField
            label={MACHINE_LABELS.tableLoadCapacity}
            value={form.tableLoadCapacity}
            example={numberMeta.tableLoadCapacity.example}
            hint={numberMeta.tableLoadCapacity.unitHint}
            error={fieldErrors.tableLoadCapacity}
            inputMode="decimal"
            disabled={loading}
            onChange={(v) => setField('tableLoadCapacity', v)}
          />
          <TextField
            label={MACHINE_LABELS.maxWorkpieceSize}
            value={form.maxWorkpieceSize}
            disabled={loading}
            onChange={(v) => setField('maxWorkpieceSize', v)}
          />
          <NumberField
            label={MACHINE_LABELS.numberOfTables}
            value={form.numberOfTables}
            example={numberMeta.numberOfTables.example}
            hint={numberMeta.numberOfTables.unitHint}
            error={fieldErrors.numberOfTables}
            inputMode="numeric"
            disabled={loading}
            onChange={(v) => setField('numberOfTables', v)}
          />

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm text-ink-muted">{MACHINE_LABELS.notes}</span>
            <textarea
              rows={4}
              disabled={loading}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              className="resize-y rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
            />
          </label>
        </div>
      </div>
    </form>
  )
}

function TextField(props: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  hint?: string
}): JSX.Element {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-ink-muted">
        {props.label}
        {props.required ? ' *' : ''}
      </span>
      <input
        type="text"
        required={props.required}
        disabled={props.disabled}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
      />
      {props.hint && <span className="text-xs text-ink-faint">{props.hint}</span>}
    </label>
  )
}

function NumberField(props: {
  label: string
  value: string
  example: string
  hint: string
  error?: string
  inputMode: 'numeric' | 'decimal'
  disabled?: boolean
  onChange: (value: string) => void
}): JSX.Element {
  const hasError = Boolean(props.error)
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-ink-muted">{props.label}</span>
      <input
        type="text"
        inputMode={props.inputMode}
        disabled={props.disabled}
        value={props.value}
        placeholder={`наприклад: ${props.example}`}
        aria-invalid={hasError}
        onChange={(e) => props.onChange(e.target.value)}
        className={[
          'rounded-lg border bg-surface-overlay px-3 py-2 text-ink outline-none disabled:opacity-50',
          hasError
            ? 'border-red-500/60 focus:border-red-400'
            : 'border-white/10 focus:border-accent'
        ].join(' ')}
      />
      <span className={`text-xs ${hasError ? 'text-red-300' : 'text-ink-faint'}`}>
        {props.error ?? `${props.hint}, наприклад ${props.example}`}
      </span>
    </label>
  )
}
