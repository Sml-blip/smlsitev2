import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'sml-seo-cron-2026';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Pick products with short/missing descriptions
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, category, description')
      .limit(50);

    const poorProducts = (products || [])
      .filter((p: { description?: string }) => !p.description || p.description.length < 120)
      .slice(0, 3);

    const aiBase = `${SITE_URL}/api/seo/ai`;

    for (const product of poorProducts) {
      const res = await fetch(aiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'keywords',
          prompt: 'Find SEO keywords for this product',
          context: { productName: product.name, category: product.category },
        }),
      });

      if (res.ok) {
        const { result } = await res.json();
        const keywordLines = (result as string).split('\n').filter(Boolean);
        results.push(`${keywordLines.length} keywords found for "${product.name}"`);

        await supabase.from('seo_suggestions').upsert({
          product_id: product.id,
          type: 'keywords',
          content: result,
          generated_at: new Date().toISOString(),
        });
      }
    }

    // Homepage long-tail keywords
    const homeRes = await fetch(aiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'longtail',
        prompt: 'Find long-tail keywords for a Tunisian computer hardware store',
        context: { url: 'https://sml.boutique' },
      }),
    });

    if (homeRes.ok) {
      const { result } = await homeRes.json();
      const count = (result as string).split('\n').filter(Boolean).length;
      results.push(`${count} long-tail keywords generated for homepage`);
    }

    return NextResponse.json({
      success: true,
      processed: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
