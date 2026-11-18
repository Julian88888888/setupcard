import { defineConfig } from 'drizzle-kit'
import { config as loadEnv } from 'dotenv'

loadEnv()

/**
 * Drizzle Kit config — used only for generating migrations (`npm run db:generate`).
 * Runtime migrations are applied in the main process on startup.
 */
export default defineConfig({
  schema: './src/main/db/schema.ts',
  out: './src/main/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://setupcard:setupcard@127.0.0.1:5432/setupcard'
  }
})
