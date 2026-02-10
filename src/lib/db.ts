import { Pool } from 'pg';
import { initDb } from './init-db';

let pool: Pool | null = null;
let initialized = false;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(text: string, params?: unknown[]) {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
  const client = getPool();
  return client.query(text, params);
}
