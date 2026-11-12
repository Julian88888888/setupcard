# SetupCard

Basic Electron desktop app scaffold with SQLite, React, and a secure IPC boundary.

## Stack

- **Electron** + **electron-vite**
- **React** + **TypeScript** + **Tailwind CSS**
- **Zustand** (renderer state)
- **better-sqlite3** + **Drizzle ORM** (main process)
- **Zod** (validate all renderer → main payloads)
- **electron-builder** (packaging)
- **electron-log** (logging)

## Architecture

```
src/
  main/          # Node process: DB, IPC, media:// protocol, backups
  preload/       # contextBridge API (no Node leak to renderer)
  renderer/      # React UI
  shared/        # Zod schemas, IPC channel names, shared types
```

| Concern | Location |
|--------|----------|
| SQLite path | `userData/app.db` |
| Images | `userData/images/` (DB stores **relative** paths only) |
| Media URL | `media://local/<relative-path>` |
| WAL | `journal_mode=WAL`, `synchronous=NORMAL` |
| Security | `contextIsolation`, `nodeIntegration: false`, `sandbox: true` |

## Scripts

```bash
npm install
npm run dev          # development with HMR
npm run build        # compile main/preload/renderer
npm run dist         # build + electron-builder
npm run db:generate  # drizzle-kit generate after schema changes
```

If `better-sqlite3` fails to compile against a very new Node (no prebuild / no Python), install without scripts and rebuild for Electron:

```bash
npm install --ignore-scripts
npm run rebuild:native
```

## Notes

- Native module `better-sqlite3` is externalized and listed in `asarUnpack`.
- Migrations run automatically on startup from `src/main/db/migrations` (dev) or `resources/migrations` (packaged).
- Backup zip contains `app.db` + `images/`.
- Renderer talks to main only through `window.api` (preload `contextBridge`); all IPC inputs are Zod-validated.
