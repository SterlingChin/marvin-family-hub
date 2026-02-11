import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { getEvents } from '@/lib/google';

export async function GET() {
  try {
    const family = await requireFamily();
    const events = await getEvents(family.id);
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
