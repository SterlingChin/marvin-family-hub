import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const result = await query('SELECT * FROM conversations WHERE family_id = $1 ORDER BY updated_at DESC', [family.id]);
    return NextResponse.json(result.rows);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const family = await requireFamily();
    const body = await request.json().catch(() => ({}));
    const title = body.title || 'New conversation';
    const result = await query('INSERT INTO conversations (family_id, title) VALUES ($1, $2) RETURNING *', [family.id, title]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
