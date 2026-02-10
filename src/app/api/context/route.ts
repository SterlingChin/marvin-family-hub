import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const result = await query('SELECT * FROM family_context WHERE family_id = $1 ORDER BY key', [family.id]);
    return NextResponse.json(result.rows);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const family = await requireFamily();
    const { key, content } = await request.json();
    if (!key || !content) return NextResponse.json({ error: 'Key and content required' }, { status: 400 });
    const result = await query(
      `INSERT INTO family_context (family_id, key, content) VALUES ($1, $2, $3)
       ON CONFLICT (family_id, key) DO UPDATE SET content = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [family.id, key, content]
    );
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
