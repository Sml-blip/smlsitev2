/**
 * Notifies Google Indexing API that a URL has been updated.
 * Uses the same GSC OAuth token (refresh_token) stored in seo_tokens.
 * Fires-and-forgets — never throws, so it never breaks the main request.
 */
export async function pingGoogleIndexing(url: string): Promise<void> {
  try {
    // Get a fresh access token using the stored refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GSC_CLIENT_ID!,
        client_secret: process.env.GSC_CLIENT_SECRET!,
        refresh_token: await getStoredRefreshToken(),
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) return;

    await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    });
  } catch {
    // Silent — never block the main request
  }
}

async function getStoredRefreshToken(): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from('seo_tokens')
    .select('refresh_token')
    .eq('id', 'gsc')
    .single();
  return data?.refresh_token ?? '';
}
