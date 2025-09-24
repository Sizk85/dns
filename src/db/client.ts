import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create database connection with runtime check
function createDatabase() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') {
      // Return dummy for build time
      return null as any;
    }
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return drizzle(pool, { schema });
}

export const db = createDatabase();
