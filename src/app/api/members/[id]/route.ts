import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    const { name, role, age, school, work, notes, avatar } = await request.json();
    const result = await query(
      `UPDATE family_members SET name = COALESCE($1, name), role = COALESCE($2, role), age = $3, school = $4, work = $5, notes = $6, avatar = COALESCE($7, avatar)
       WHERE id = $8 AND family_id = $9 RETURNING *`,
      [name, role, age ?? null, school ?? null, work ?? null, notes ?? null, avatar, id, family.id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    const result = await query('DELETE FROM family_members WHERE id = $1 AND family_id = $2 RETURNING id', [id, family.id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
