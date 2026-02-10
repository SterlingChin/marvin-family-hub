import { NextRequest, NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await query('SELECT * FROM chores WHERE id = $1 AND family_id = $2', [id, family.id]);
    if (existing.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.title !== undefined) { updates.push(`title = $${idx++}`); values.push(body.title); }
    if (body.assigned_to !== undefined) { updates.push(`assigned_to = $${idx++}`); values.push(body.assigned_to); }
    if (body.frequency !== undefined) { updates.push(`frequency = $${idx++}`); values.push(body.frequency); }
    if (body.completed !== undefined) {
      updates.push(`completed = $${idx++}`);
      values.push(body.completed);
      if (body.completed) {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      } else {
        updates.push(`completed_at = NULL`);
      }
    }

    if (updates.length === 0) return NextResponse.json({ error: 'No updates' }, { status: 400 });

    values.push(id, family.id);
    const result = await query(
      `UPDATE chores SET ${updates.join(', ')} WHERE id = $${idx++} AND family_id = $${idx} RETURNING *`,
      values
    );
    return NextResponse.json({ chore: result.rows[0] });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    await query('DELETE FROM chores WHERE id = $1 AND family_id = $2', [id, family.id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
