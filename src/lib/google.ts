import { google } from 'googleapis';
import { query } from './db';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://marvin-family-hub.vercel.app/api/google/callback'
  );
}

export function getAuthUrl(familyId: string) {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: familyId,
  });
}

export async function getAuthedClient(familyId: string) {
  const result = await query(
    'SELECT * FROM google_tokens WHERE family_id = $1 ORDER BY updated_at DESC LIMIT 1',
    [familyId]
  );
  if (result.rows.length === 0) return null;

  const token = result.rows[0];
  const client = getOAuth2Client();
  client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: new Date(token.token_expiry).getTime(),
  });

  // Refresh if expired
  if (new Date(token.token_expiry) < new Date()) {
    const { credentials } = await client.refreshAccessToken();
    await query(
      `UPDATE google_tokens SET access_token = $1, token_expiry = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [credentials.access_token, new Date(credentials.expiry_date!).toISOString(), token.id]
    );
    client.setCredentials(credentials);
  }

  return client;
}

// Simple in-memory cache
const eventCache = new Map<string, { data: CalendarEvent[]; expires: number }>();

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarId: string;
  calendarName: string;
  assignedMember?: string;
  allDay: boolean;
}

export async function getEvents(familyId: string): Promise<CalendarEvent[]> {
  const cached = eventCache.get(familyId);
  if (cached && cached.expires > Date.now()) return cached.data;

  const client = await getAuthedClient(familyId);
  if (!client) return [];

  const calendar = google.calendar({ version: 'v3', auth: client });

  // Get enabled calendars
  const configs = await query(
    'SELECT * FROM calendar_config WHERE family_id = $1 AND enabled = TRUE',
    [familyId]
  );
  if (configs.rows.length === 0) return [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfTomorrow = new Date(startOfToday.getTime() + 2 * 24 * 60 * 60 * 1000);

  const allEvents: CalendarEvent[] = [];

  for (const config of configs.rows) {
    try {
      const res = await calendar.events.list({
        calendarId: config.calendar_id,
        timeMin: startOfToday.toISOString(),
        timeMax: endOfTomorrow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });

      for (const event of res.data.items || []) {
        if (!event.summary) continue;
        const isAllDay = !!event.start?.date;
        allEvents.push({
          id: event.id || '',
          title: event.summary,
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          calendarId: config.calendar_id,
          calendarName: config.calendar_name || config.calendar_id,
          assignedMember: config.assigned_member || undefined,
          allDay: isAllDay,
        });
      }
    } catch (e) {
      console.error(`Failed to fetch calendar ${config.calendar_id}:`, e);
    }
  }

  allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Cache for 5 minutes
  eventCache.set(familyId, { data: allEvents, expires: Date.now() + 5 * 60 * 1000 });

  return allEvents;
}
