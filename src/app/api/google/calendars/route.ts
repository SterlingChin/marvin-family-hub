import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { getAuthedClient } from '@/lib/google';
import { google } from 'googleapis';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const family = await requireFamily();
    const client = await getAuthedClient(family.id);
    if (!client) {
      return NextResponse.json({ error: 'Not connected to Google' }, { status: 400 });
    }

    const calendar = google.calendar({ version: 'v3', auth: client });
    const res = await calendar.calendarList.list();

    // Get current config
    const configs = await query(
      'SELECT calendar_id, assigned_member, enabled FROM calendar_config WHERE family_id = $1',
      [family.id]
    );
    const configMap = new Map(configs.rows.map((c: { calendar_id: string; assigned_member: string; enabled: boolean }) => [c.calendar_id, c]));

    const calendars = (res.data.items || []).map(cal => {
      const config = configMap.get(cal.id || '');
      return {
        id: cal.id,
        name: cal.summary,
        description: cal.description,
        color: cal.backgroundColor,
        enabled: config ? (config as { enabled: boolean }).enabled : false,
        assignedMember: config ? (config as { assigned_member: string }).assigned_member : null,
      };
    });

    return NextResponse.json({ calendars });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}
