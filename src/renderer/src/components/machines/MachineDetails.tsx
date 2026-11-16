import type { Machine } from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'
import { MACHINE_LABELS } from './machineLabels'

interface MachineDetailsProps {
  machine: Machine
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function MachineDetails({
  machine,
  onBack,
  onEdit,
  onDelete
}: MachineDetailsProps): JSX.Element {
  const photoSrc = mediaUrl(machine.photoPath)

  const rows: Array<{ label: string; value: string }> = [
    { label: MACHINE_LABELS.inventoryNumber, value: formatValue(machine.inventoryNumber) },
    { label: MACHINE_LABELS.machineType, value: formatValue(machine.machineType) },
    { label: MACHINE_LABELS.controlSystemType, value: formatValue(machine.controlSystemType) },
    { label: MACHINE_LABELS.spindleTaper, value: formatValue(machine.spindleTaper) },
    { label: MACHINE_LABELS.maxSpindleSpeed, value: formatValue(machine.maxSpindleSpeed) },
    { label: MACHINE_LABELS.magazineCapacity, value: formatValue(machine.magazineCapacity) },
    { label: MACHINE_LABELS.maxToolLength, value: formatValue(machine.maxToolLength) },
    { label: MACHINE_LABELS.maxToolDiameter, value: formatValue(machine.maxToolDiameter) },
    { label: MACHINE_LABELS.maxToolWeight, value: formatValue(machine.maxToolWeight) },
    { label: MACHINE_LABELS.tableSize, value: formatValue(machine.tableSize) },
    { label: MACHINE_LABELS.axisTravel, value: formatValue(machine.axisTravel) },
    { label: MACHINE_LABELS.tableLoadCapacity, value: formatValue(machine.tableLoadCapacity) },
    { label: MACHINE_LABELS.maxWorkpieceSize, value: formatValue(machine.maxWorkpieceSize) },
    { label: MACHINE_LABELS.numberOfTables, value: formatValue(machine.numberOfTables) }
  ]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-sm text-ink-muted transition hover:text-ink"
          >
            ← До списку
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{machine.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">{machine.inventoryNumber}</p>
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

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-overlay">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={machine.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-ink-faint">
              Немає фото
            </div>
          )}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className={[
                'rounded-lg border border-white/5 bg-surface-raised/50 px-3 py-2.5',
                row.label === MACHINE_LABELS.machineType ? 'sm:col-span-2' : ''
              ].join(' ')}
            >
              <dt className="text-xs text-ink-faint">{row.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {machine.notes && (
        <section className="rounded-xl border border-white/10 bg-surface-raised/50 p-4">
          <h2 className="text-sm font-medium text-ink-muted">{MACHINE_LABELS.notes}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{machine.notes}</p>
        </section>
      )}
    </div>
  )
}
