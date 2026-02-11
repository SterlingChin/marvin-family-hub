import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const result = await query(
      'SELECT id FROM google_tokens WHERE family_id = $1 LIMIT 1',
      [family.id]
    );
    return NextResponse.json({ connected: result.rows.length > 0 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const family = await requireFamily();
    await query('DELETE FROM google_tokens WHERE family_id = $1', [family.id]);
    await query('DELETE FROM calendar_config WHERE family_id = $1', [family.id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
