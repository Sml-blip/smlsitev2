import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sml.boutique';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.from('seo_tokens').select('*').eq('id', 'gsc').single();
  if (!data?.refresh_token) return null;

  const needsRefresh = !data.expires_at || Date.now() > data.expires_at - 300000;
  if (!needsRefresh && data.access_token) return data.access_token;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GSC_CLIENT_ID!,
      client_secret: process.env.GSC_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const tokens = await res.json();
  if (tokens.error || !tokens.access_token) return null;

  await supabase.from('seo_tokens').update({
    access_token: tokens.access_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
  }).eq('id', 'gsc');

  return tokens.access_token;
}

async function pingUrl(token: string, url: string): Promise<'ok' | 'quota' | 'scope' | 'error'> {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });

  if (res.status === 200) return 'ok';
  if (res.status === 429) return 'quota';
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body?.error?.details?.[0]?.reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT') return 'scope';
  }
  return 'error';
}

export async function POST() {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'not_connected' }, { status: 401 });
    }

    // Build the full list of URLs to ping
    // 1. Static pages
    const staticUrls = [SITE_URL, `${SITE_URL}/shop`];

    // 2. All product slugs
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .not('slug', 'is', null);

    const productUrls = (products || [])
      .filter((p: any) => p.slug)
      .map((p: any) => `${SITE_URL}/shop/${p.slug}`);

    const allUrls = [...staticUrls, ...productUrls];

    // Ping each URL — Google Indexing API quota: 200 req/day
    // We go one by one with a small delay to avoid bursting
    const results: { url: string; status: 'ok' | 'quota' | 'scope' | 'error' }[] = [];
    let quotaHit = false;
    let scopeError = false;

    for (const url of allUrls) {
      if (quotaHit || scopeError) {
        results.push({ url, status: scopeError ? 'scope' : 'error' });
        continue;
      }
      const status = await pingUrl(token, url);
      results.push({ url, status });
      if (status === 'quota') quotaHit = true;
      if (status === 'scope') scopeError = true;
      await new Promise(r => setTimeout(r, 50));
    }

    const ok = results.filter(r => r.status === 'ok').length;
    const errors = results.filter(r => r.status === 'error').length;
    const quota = results.filter(r => r.status === 'quota').length;

    return NextResponse.json({
      total: allUrls.length,
      ok,
      errors,
      quotaHit: quota > 0,
      needsReauth: scopeError,
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
