import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Settings as SettingsType } from '../../../shared/schemas'

/**
 * Settings panel — theme, language, auto-backup, and backup export/import.
 * Rendered as an interactive card on the main page (allowed by design rules for UI controls).
 */
export function SettingsPanel(): JSX.Element {
  const {
    settings,
    paths,
    loading,
    loadSettings,
    loadPaths,
    saveSettings,
    exportBackup,
    importBackup
  } = useAppStore()

  useEffect(() => {
    void loadSettings()
    void loadPaths()
  }, [loadSettings, loadPaths])

  if (!settings) {
    return (
      <section className="rounded-xl border border-white/10 bg-surface-raised/80 p-6 backdrop-blur">
        <p className="text-ink-muted">Завантаження налаштувань…</p>
      </section>
    )
  }

  const onThemeChange = (theme: SettingsType['theme']): void => {
    void saveSettings({ theme })
  }

  const onLanguageChange = (language: string): void => {
    void saveSettings({ language })
  }

  const onAutoBackupChange = (autoBackup: boolean): void => {
    void saveSettings({ autoBackup })
  }

  return (
    <section className="rounded-xl border border-white/10 bg-surface-raised/80 p-6 shadow-lg shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-muted">Тема</span>
          <select
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent"
            value={settings.theme}
            disabled={loading}
            onChange={(e) => onThemeChange(e.target.value as SettingsType['theme'])}
          >
            <option value="system">Системна</option>
            <option value="light">Світла</option>
            <option value="dark">Темна</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-muted">Мова</span>
          <select
            className="rounded-lg border border-white/10 bg-surface-overlay px-3 py-2 text-ink outline-none focus:border-accent"
            value={settings.language}
            disabled={loading}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={settings.autoBackup}
            disabled={loading}
            onChange={(e) => onAutoBackupChange(e.target.checked)}
          />
          <span className="text-sm text-ink">Автоматичне резервне копіювання</span>
        </label>

        <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            disabled={loading}
            onClick={() => void exportBackup()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            Експорт резервної копії
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void importBackup()}
            className="rounded-lg border border-white/15 bg-surface-overlay px-4 py-2 text-sm font-medium text-ink transition hover:border-accent/50 disabled:opacity-50"
          >
            Імпорт резервної копії
          </button>
        </div>

        {paths && (
          <dl className="grid gap-1 border-t border-white/10 pt-4 text-xs text-ink-faint">
            <div className="flex gap-2">
              <dt className="shrink-0">Дані:</dt>
              <dd className="truncate font-mono" title={paths.userData}>
                {paths.userData}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">PostgreSQL:</dt>
              <dd className="truncate font-mono" title={paths.database}>
                {paths.database}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}
