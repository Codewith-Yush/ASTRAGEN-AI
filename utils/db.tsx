import "server-only";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_DB_URL || '';

if (!connectionString && process.env.NODE_ENV === 'production') {
  console.warn("⚠️ [Database Warning]: DATABASE_URL is not configured.");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
