import "server-only";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Fallback connection string prevents neon() from throwing during Next.js static build / page configuration collection when env variables are not present.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEXT_PUBLIC_DRIZZLE_DB_URL ||
  'postgresql://placeholder:placeholder@localhost:5432/neondb';

if (!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
  if (process.env.NODE_ENV === 'production') {
    console.warn("⚠️ [Database Warning]: DATABASE_URL is not configured in environment variables.");
  }
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
