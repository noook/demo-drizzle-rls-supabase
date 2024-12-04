import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../database/schema'

export const tables = schema

let drizzleClient: NodePgDatabase<typeof schema>

export function useDrizzle() {
  if (!drizzleClient) {
    drizzleClient = drizzle(import.meta.env.DATABASE_URL, { schema })
  }

  return drizzleClient
}
