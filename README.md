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

```
src/
  main/          # Node process: DB, IPC, media:// protocol, backups
  preload/       # contextBridge API (no Node leak to renderer)
  renderer/      # React UI
  shared/        # Zod schemas, IPC channel names, shared types
```

| Concern | Location |
|--------|----------|
| Database | PostgreSQL via `DATABASE_URL` (default Docker Compose) |
| Images | `userData/images/` (DB stores **relative** paths only) |
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
