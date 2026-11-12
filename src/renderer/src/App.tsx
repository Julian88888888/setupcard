import { SettingsPanel } from './components/Settings'
import { useAppStore } from './store/useAppStore'

function App(): JSX.Element {
  const statusMessage = useAppStore((s) => s.statusMessage)

  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-14">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">SetupCard</p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Привіт, я програма
          </h1>
          <p className="max-w-xl text-base text-ink-muted">
            Electron · React · SQLite — базова оболонка з безпечним IPC, міграціями та резервними
            копіями.
          </p>
        </header>

        <SettingsPanel />

        {statusMessage && (
          <p
            role="status"
            className="rounded-lg border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-ink"
          >
            {statusMessage}
          </p>
        )}
      </main>
    </div>
  )
}

export default App
