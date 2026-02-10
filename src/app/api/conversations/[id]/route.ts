import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    const conv = await query('SELECT * FROM conversations WHERE id = $1 AND family_id = $2', [id, family.id]);
    if (conv.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const messages = await query('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at', [id]);
    return NextResponse.json({ conversation: conv.rows[0], messages: messages.rows });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const family = await requireFamily();
    const { id } = await params;
    const result = await query('DELETE FROM conversations WHERE id = $1 AND family_id = $2 RETURNING id', [id, family.id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
