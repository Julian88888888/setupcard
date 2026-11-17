interface DeletePartDialogProps {
  title: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeletePartDialog({
  title,
  loading,
  onConfirm,
  onCancel
}: DeletePartDialogProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-part-title"
    >
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-surface-raised p-6 shadow-2xl">
        <h2 id="delete-part-title" className="text-lg font-semibold text-ink">
          Видалити деталь?
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          «{title}» буде видалено назавжди. Цю дію неможливо скасувати.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-white/15 bg-surface-overlay px-4 py-2 text-sm font-medium text-ink transition hover:border-white/30 disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            Видалити
          </button>
        </div>
      </div>
    </div>
  )
}
