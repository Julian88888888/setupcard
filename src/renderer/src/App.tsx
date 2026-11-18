import { MaterialsPage } from './components/catalogs/MaterialsPage'
import { WorkpieceTypesPage } from './components/catalogs/WorkpieceTypesPage'
import { Sidebar } from './components/layout/Sidebar'
import { MachinesPage } from './components/machines/MachinesPage'
import { PartsPage } from './components/parts/PartsPage'
import { SettingsPanel } from './components/Settings'
import { useAppStore } from './store/useAppStore'

function App(): JSX.Element {
  const section = useAppStore((s) => s.section)
  const statusMessage = useAppStore((s) => s.statusMessage)

  return (
    <div className="flex h-full min-h-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto px-6 py-8 lg:px-10">
          {section === 'machines' && <MachinesPage />}
          {section === 'parts' && <PartsPage />}
          {section === 'materials' && <MaterialsPage />}
          {section === 'workpieceTypes' && <WorkpieceTypesPage />}
          {section === 'settings' && (
            <div className="mx-auto w-full max-w-2xl">
              <header className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Налаштування</h1>
                <p className="mt-1 text-sm text-ink-muted">Тема, мова та резервне копіювання</p>
              </header>
              <SettingsPanel />
            </div>
          )}

          {statusMessage && (
            <p
              role="status"
              className="mx-auto mt-6 max-w-2xl rounded-lg border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-ink"
            >
              {statusMessage}
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
