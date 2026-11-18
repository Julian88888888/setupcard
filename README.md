# SetupCard

Electron desktop app for machining setup cards — PostgreSQL, React, and a secure IPC boundary.

## Stack

- **Electron** + **electron-vite**
- **React** + **TypeScript** + **Tailwind CSS**
- **Zustand** (renderer state)
- **PostgreSQL** (Docker Compose) + **Drizzle ORM** + **pg** (main process)
- **Zod** (validate all renderer → main payloads)
- **electron-builder** (packaging)
- **electron-log** (logging)

## Architecture

```mermaid
flowchart LR
  Renderer[renderer React UI]
  Preload[preload contextBridge]
  Main[main process]
  PG[(PostgreSQL Docker)]
  Images[userData/images]

  Renderer -->|window.api| Preload -->|IPC Zod| Main
  Main --> PG
  Main --> Images
```

### Folder layout

```
setupcard/
├── docker-compose.yml      # Local PostgreSQL (Docker)
├── drizzle.config.ts       # Drizzle Kit (generate migrations only)
├── electron-builder.yml    # Windows/macOS/Linux packaging
├── electron.vite.config.ts # electron-vite build (main / preload / renderer)
├── .env.example            # DATABASE_URL template
├── package.json
├── resources/              # electron-builder build resources
└── src/
    ├── main/               # Electron main process (Node, privileged)
    │   ├── index.ts        # App lifecycle, window, startup DB init
    │   ├── logger.ts       # electron-log
    │   ├── db/
    │   │   ├── index.ts    # Pool + Drizzle init, seed, paths
    │   │   ├── schema.ts   # Drizzle tables (source of truth)
    │   │   ├── migrate.ts  # Apply SQL migrations on startup
    │   │   ├── seed-catalogs.ts
    │   │   └── migrations/ # SQL files + meta/_journal.json
    │   ├── ipc/
    │   │   ├── handlers.ts # Settings, items, paths, backup wiring
    │   │   ├── machines.ts
    │   │   ├── materials.ts
    │   │   ├── workpiece-types.ts
    │   │   ├── parts.ts
    │   │   └── backup.ts  # dump.sql + images zip
    │   ├── protocol/
    │   │   └── media.ts    # media://local/… for images
    │   └── utils/
    │       ├── images.ts   # Pick/save photo helpers
    │       └── electron-toolkit.ts
    ├── preload/
    │   ├── index.ts        # contextBridge → window.api
    │   └── index.d.ts      # TypeScript types for window.api
    ├── renderer/           # React UI (sandboxed, no Node)
    │   └── src/
    │       ├── App.tsx
    │       ├── main.tsx
    │       ├── components/
    │       │   ├── layout/     # Sidebar, shell
    │       │   ├── machines/   # Machines CRUD UI
    │       │   ├── parts/      # Parts list / form / details
    │       │   ├── catalogs/   # Materials, workpiece types, ISO badge
    │       │   └── Settings.tsx
    │       ├── store/          # Zustand (UI state only)
    │       └── lib/media.ts    # mediaUrl() helper
    └── shared/             # Used by main + preload (+ types for renderer)
        ├── schemas.ts      # Zod schemas / DTOs
        ├── ipc-channels.ts # Channel name constants
        ├── types.ts
        └── index.ts
```

### What lives where

| Layer | Responsibility |
|-------|----------------|
| `src/main` | DB, filesystem, dialogs, IPC handlers, backups |
| `src/preload` | Thin bridge: exposes `window.api`, no business logic |
| `src/renderer` | UI only; talks to main via `window.api` |
| `src/shared` | Contracts shared across processes (Zod + channel names) |

| Concern | Location |
|--------|----------|
| Database | PostgreSQL via `DATABASE_URL` (default Docker Compose) |
| Images | Electron `userData/images/` (DB stores **relative** paths only) |
| Media URL | `media://local/<relative-path>` |
| Security | `contextIsolation`, `nodeIntegration: false`, `sandbox: true` |

## Images (how photos are saved and loaded)

Photos are **not** stored in PostgreSQL as blobs. Files live on disk; the DB keeps only a **relative** path.

```mermaid
flowchart TD
  UI[Renderer: pick photo button]
  IPC[IPC machines:pick-photo / parts:pick-photo]
  Dialog[Main: native file dialog]
  Copy[Copy into userData/images/subdir/uuid.ext]
  DB[(Postgres: photo_path / part_photos)]
  MediaUrl[mediaUrl relativePath]
  Protocol[media:// protocol handler]
  Disk[Read file under images/]

  UI --> IPC --> Dialog --> Copy
  Copy -->|relative path e.g. machines/abc.jpg| UI
  UI -->|save form| DB
  UI -->|img src| MediaUrl --> Protocol --> Disk
```

### 1. Save (upload)

1. UI calls `window.api.machines.pickPhoto()` or `window.api.parts.pickPhoto()`.
2. Main opens a native dialog ([`src/main/utils/images.ts`](src/main/utils/images.ts) / machines handler).
3. Allowed extensions: `jpg`, `jpeg`, `png`, `webp`, `gif`, `bmp`.
4. File is copied to:
   - machines → `{userData}/images/machines/<uuid>.<ext>`
   - parts → `{userData}/images/parts/<uuid>.<ext>`
5. IPC returns a **relative** path, e.g. `machines/a1b2….jpg` (never an absolute path).
6. On form save that string is written to DB:
   - machines: `machines.photo_path`
   - parts: rows in `part_photos.photo_path` (+ `sort_order`)

### 2. Display (load in UI)

1. Renderer gets relative path(s) from list/detail IPC.
2. [`src/renderer/src/lib/media.ts`](src/renderer/src/lib/media.ts) builds:
   ```
   media://local/machines/a1b2….jpg
   ```
3. `<img src={mediaUrl(path)} />` requests that URL.
4. Main protocol [`src/main/protocol/media.ts`](src/main/protocol/media.ts):
   - registered as privileged **before** `app.ready`
   - handler bound **after** ready
   - resolves only under `userData/images/` (blocks `..` / path traversal)
   - serves the file via `net.fetch(file://…)`

### 3. Delete / replace

- Replacing or clearing a machine photo deletes the old file from disk.
- Deleting a part deletes its `part_photos` rows (FK cascade) and removes files from disk.
- Backup zip includes the whole `images/` folder together with `dump.sql`.

### Paths cheat sheet

| What | Where |
|------|--------|
| On disk | Electron `app.getPath('userData')/images/…` |
| In DB | Relative only: `machines/…`, `parts/…` |
| In UI | `media://local/<relative>` via `mediaUrl()` |
| Code | save: `main/utils/images.ts` · serve: `main/protocol/media.ts` · UI helper: `renderer/src/lib/media.ts` |

## Prerequisites

1. **Docker Desktop** (for local PostgreSQL)
2. Node.js + npm

## Setup

```bash
cp .env.example .env
npm install
npm run db:up          # start Postgres on localhost:5432
npm run dev            # migrations + catalog seed run on startup
```

Default connection:

```
postgresql://setupcard:setupcard@127.0.0.1:5432/setupcard
```

## Scripts

```bash
npm run db:up        # docker compose up -d
npm run db:down      # docker compose down
npm run db:generate  # drizzle-kit generate after schema changes
npm run db:studio    # drizzle-kit studio
npm run dev          # development with HMR
npm run build        # compile main/preload/renderer
npm run dist:win     # Windows installer
```

## Notes

- Migrations run automatically on startup from `src/main/db/migrations` (dev) or `resources/migrations` (packaged).
- Catalog seed (materials / workpiece types) runs once when `materials` is empty.
- Backup zip contains `dump.sql` + `images/` (no `pg_dump` required on the host).
- Renderer talks to main only through `window.api` (preload `contextBridge`); all IPC inputs are Zod-validated.
