import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    const { title, due_at, assigned_to, completed } = await request.json();
    const result = await query(
      `UPDATE reminders SET title = COALESCE($1, title), due_at = COALESCE($2, due_at), assigned_to = COALESCE($3, assigned_to), completed = COALESCE($4, completed)
       WHERE id = $5 AND family_id = $6 RETURNING *`,
      [title, due_at, assigned_to, completed, id, family.id]
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
    const result = await query('DELETE FROM reminders WHERE id = $1 AND family_id = $2 RETURNING id', [id, family.id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
