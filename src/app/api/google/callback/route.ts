import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const familyId = req.nextUrl.searchParams.get('state');

  if (!code || !familyId) {
    return NextResponse.redirect(new URL('/settings?google=error', req.url));
  }

  try {
    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);

    // Upsert token
    await query(
      `INSERT INTO google_tokens (family_id, access_token, refresh_token, token_expiry)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (family_id)
       DO UPDATE SET access_token = $2, refresh_token = COALESCE($3, google_tokens.refresh_token), token_expiry = $4, updated_at = CURRENT_TIMESTAMP`,
      [familyId, tokens.access_token, tokens.refresh_token, new Date(tokens.expiry_date!).toISOString()]
    );

    return NextResponse.redirect(new URL('/settings?google=success', req.url));
  } catch (e) {
    console.error('Google OAuth callback error:', e);
    return NextResponse.redirect(new URL('/settings?google=error', req.url));
  }
}
