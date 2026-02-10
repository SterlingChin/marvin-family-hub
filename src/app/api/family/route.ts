import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const members = await query('SELECT * FROM family_members WHERE family_id = $1 ORDER BY created_at', [family.id]);
    return NextResponse.json({ family: { ...family, members: members.rows } });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const family = await requireFamily();
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const result = await query('UPDATE families SET name = $1 WHERE id = $2 RETURNING *', [name, family.id]);
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
