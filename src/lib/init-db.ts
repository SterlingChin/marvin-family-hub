import { getPool } from './db';

export async function initDb() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      clerk_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'child',
      age INTEGER,
      school TEXT,
      work TEXT,
      notes TEXT,
      avatar TEXT DEFAULT '👤',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
      title TEXT DEFAULT 'New conversation',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_at TIMESTAMP,
      assigned_to TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS chores (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      assigned_to TEXT,
      frequency TEXT DEFAULT 'daily',
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS google_tokens (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT UNIQUE REFERENCES families(id) ON DELETE CASCADE,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      token_expiry TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS calendar_config (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
      calendar_id TEXT NOT NULL,
      calendar_name TEXT,
      assigned_member TEXT,
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS family_context (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      family_id TEXT REFERENCES families(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(family_id, key)
    );
  `);

  // Add avatar column if it doesn't exist (migration for existing DBs)
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE family_members ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '👤';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `).catch(() => {});
}
