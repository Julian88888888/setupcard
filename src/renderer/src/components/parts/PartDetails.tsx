import type { PartDetail } from '../../../../shared/schemas'
import { mediaUrl } from '../../lib/media'
import { MATERIAL_CATEGORY_LABELS } from '../catalogs/labels'

interface PartDetailsProps {
  part: PartDetail
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

export function PartDetails({ part, onBack, onEdit, onDelete }: PartDetailsProps): JSX.Element {
  const photos = part.photoPaths.map((p) => mediaUrl(p)).filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-muted transition hover:text-ink"
        >
          ← До списку
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-white/15 bg-surface-overlay px-4 py-2 text-sm font-medium text-ink transition hover:border-accent/50"
          >
            Редагувати
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            Видалити
          </button>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{part.name}</h1>
        <p className="text-sm text-ink-muted">
          <span className="font-mono text-accent">{part.code}</span>
          <span className="text-ink-faint"> · </span>
          <span>
            {part.materialName
              ? `${part.materialName}${
                  part.materialCategory
                    ? ` (${MATERIAL_CATEGORY_LABELS[part.materialCategory]})`
                    : ''
                }`
              : 'матеріал не вказано'}
          </span>
        </p>
      </header>

      {photos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {photos.map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt={`${part.name} — фото ${index + 1}`}
              className="max-h-80 w-full rounded-xl object-cover object-center"
            />
          ))}
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Тип заготовки" value={part.workpieceTypeName} />
        <DetailField label="Примітки" value={part.notes} className="sm:col-span-2" />
      </dl>
    </div>
  )
}

function DetailField({
  label,
  value,
  className = ''
}: {
  label: string
  value: string | null | undefined
  className?: string
}): JSX.Element {
  return (
    <div className={`rounded-xl border border-white/10 bg-surface-raised/50 p-4 ${className}`}>
      <dt className="text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{value?.trim() || '—'}</dd>
    </div>
  )
}
