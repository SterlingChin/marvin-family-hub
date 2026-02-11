import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { getAuthUrl } from '@/lib/google';

export async function POST() {
  try {
    const family = await requireFamily();
    const url = getAuthUrl(family.id);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
