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
