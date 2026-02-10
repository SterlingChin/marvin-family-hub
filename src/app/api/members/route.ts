import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const result = await query('SELECT * FROM family_members WHERE family_id = $1 ORDER BY created_at', [family.id]);
    return NextResponse.json({ members: result.rows });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const family = await requireFamily();
    const { name, role, age, school, work, notes } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const result = await query(
      'INSERT INTO family_members (family_id, name, role, age, school, work, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [family.id, name, role || 'child', age || null, school || null, work || null, notes || null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
