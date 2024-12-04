import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: 'server/database/schema/index.ts',
  schemaFilter: ['public'],
  out: 'server/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  entities: {
    roles: {
      provider: 'supabase',
    },
  },
})
