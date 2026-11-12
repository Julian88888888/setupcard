import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Kit config — used only for generating migrations (`npm run db:generate`).
 * Runtime migrations are applied in the main process on startup.
 */
export default defineConfig({
  schema: './src/main/db/schema.ts',
  out: './src/main/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    // Path is irrelevant for generation; runtime uses userData/app.db
    url: './dev.db'
  }
})
