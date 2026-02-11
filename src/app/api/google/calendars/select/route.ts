import { NextRequest, NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

interface CalendarSelection {
  calendarId: string;
  calendarName: string;
  enabled: boolean;
  assignedMember?: string;
}

export async function POST(req: NextRequest) {
  try {
    const family = await requireFamily();
    const { calendars } = (await req.json()) as { calendars: CalendarSelection[] };

    // Delete existing config and re-insert
    await query('DELETE FROM calendar_config WHERE family_id = $1', [family.id]);

    for (const cal of calendars) {
      if (cal.enabled) {
        await query(
          `INSERT INTO calendar_config (family_id, calendar_id, calendar_name, assigned_member, enabled)
           VALUES ($1, $2, $3, $4, TRUE)`,
          [family.id, cal.calendarId, cal.calendarName, cal.assignedMember || null]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
