import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const result = await query('SELECT * FROM reminders WHERE family_id = $1 AND completed = FALSE ORDER BY due_at ASC NULLS LAST', [family.id]);
    return NextResponse.json({ reminders: result.rows });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const family = await requireFamily();
    const { title, due_at, assigned_to } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const result = await query(
      'INSERT INTO reminders (family_id, title, due_at, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
      [family.id, title, due_at || null, assigned_to || null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
