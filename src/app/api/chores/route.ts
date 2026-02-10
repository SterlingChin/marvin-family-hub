import { NextRequest, NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const family = await requireFamily();
    const status = request.nextUrl.searchParams.get('status');

    let sql = 'SELECT * FROM chores WHERE family_id = $1';
    const params: (string | boolean)[] = [family.id];

    if (status === 'active') {
      sql += ' AND completed = $2';
      params.push(false);
    } else if (status === 'completed') {
      sql += ' AND completed = $2';
      params.push(true);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return NextResponse.json({ chores: result.rows });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const family = await requireFamily();
    const { title, assigned_to, frequency } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const result = await query(
      'INSERT INTO chores (family_id, title, assigned_to, frequency) VALUES ($1, $2, $3, $4) RETURNING *',
      [family.id, title, assigned_to || null, frequency || 'daily']
    );
    return NextResponse.json({ chore: result.rows[0] }, { status: 201 });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
