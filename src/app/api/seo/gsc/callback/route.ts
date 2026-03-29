import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/seo?error=no_code', request.url));
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GSC_CLIENT_ID!,
        client_secret: process.env.GSC_CLIENT_SECRET!,
        redirect_uri: process.env.GSC_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return NextResponse.redirect(new URL(`/dashboard/seo?error=${tokens.error}`, request.url));
    }

    const expiresAt = Date.now() + tokens.expires_in * 1000;

    await supabase.from('seo_tokens').upsert({
      id: 'gsc',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: expiresAt,
    });

    return NextResponse.redirect(new URL('/dashboard/seo?connected=1', request.url));
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/dashboard/seo?error=${e.message}`, request.url));
  }
}
