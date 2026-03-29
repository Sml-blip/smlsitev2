import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function refreshToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GSC_CLIENT_ID!,
      client_secret: process.env.GSC_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const tokens = await res.json();
  if (tokens.error) return null;

  const expiresAt = Date.now() + tokens.expires_in * 1000;
  await supabase.from('seo_tokens').update({
    access_token: tokens.access_token,
    expires_at: expiresAt,
  }).eq('id', 'gsc');

  return tokens.access_token;
}

async function getValidToken(): Promise<string | null> {
  const { data } = await supabase.from('seo_tokens').select('*').eq('id', 'gsc').single();
  if (!data) return null;

  // Always refresh if within 5 minutes of expiry or already expired
  const needsRefresh = !data.expires_at || Date.now() > data.expires_at - 300000;
  if (needsRefresh) {
    if (!data.refresh_token) return null;
    return await refreshToken(data.refresh_token);
  }

  return data.access_token;
}

async function gscQuery(token: string, body: object) {
  const siteUrl = process.env.GSC_SITE_URL!;
  const encodedUrl = encodeURIComponent(siteUrl);
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

export async function GET(request: NextRequest) {
  try {
    const token = await getValidToken();
    if (!token) {
      return NextResponse.json({ error: 'not_connected' }, { status: 401 });
    }

    // Last 28 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const dateRange = { startDate: fmt(startDate), endDate: fmt(endDate) };

    // Fetch queries (keywords)
    const keywordsData = await gscQuery(token, {
      ...dateRange,
      dimensions: ['query'],
      rowLimit: 25,
      orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
    });

    // Fetch pages
    const pagesData = await gscQuery(token, {
      ...dateRange,
      dimensions: ['page'],
      rowLimit: 20,
      orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
    });

    // Fetch daily clicks for chart (last 28 days)
    const chartData = await gscQuery(token, {
      ...dateRange,
      dimensions: ['date'],
      rowLimit: 28,
      orderBy: [{ fieldName: 'date', sortOrder: 'ASCENDING' }],
    });

    const keywords = (keywordsData.rows || []).map((r: any) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: +(r.ctr * 100).toFixed(1),
      position: +r.position.toFixed(1),
      striking: r.position >= 8 && r.position <= 20,
    }));

    const pages = (pagesData.rows || []).map((r: any) => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: +(r.ctr * 100).toFixed(1),
      position: +r.position.toFixed(1),
    }));

    const chart = (chartData.rows || []).map((r: any) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
    }));

    return NextResponse.json({ keywords, pages, chart });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
