import { NextRequest, NextResponse } from 'next/server';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 502 });

    const html = await res.text();

    // ── helpers ──────────────────────────────────────────────────────────────
    const meta = (prop: string): string => {
      const m =
        html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
      return decodeHtmlEntities(m?.[1]?.trim() ?? '');
    };

    const tag = (t: string, cls?: string): string => {
      const pattern = cls
        ? `<${t}[^>]*class=["'][^"']*${cls}[^"']*["'][^>]*>([^<]{1,500})<\\/${t}>`
        : `<${t}[^>]*>([^<]{1,500})<\\/${t}>`;
      const m = html.match(new RegExp(pattern, 'i'));
      return decodeHtmlEntities(m?.[1]?.trim() ?? '');
    };

    // ── Title ─────────────────────────────────────────────────────────────────
    let name = meta('og:title') || meta('twitter:title') || tag('h1') || tag('title');
    // Remove site name suffix (e.g. " | Chamsi.tn" or " - Shop Name")
    name = name.replace(/\s*[|\-–—]\s*[^|\-–—]{3,40}$/, '').trim();

    // ── Description ──────────────────────────────────────────────────────────
    const description = meta('og:description') || meta('description') || meta('twitter:description');

    // ── Images ───────────────────────────────────────────────────────────────
    const images: string[] = [];
    const addImg = (src: string) => {
      const abs = src.startsWith('http') ? src : new URL(src, url).href;
      if (!images.includes(abs)) images.push(abs);
    };

    // 1. og:image
    const ogImg = meta('og:image');
    if (ogImg) addImg(ogImg);

    // 2. WooCommerce gallery (data-large_image)
    const wooGallery = [...html.matchAll(/data-large_image=["'](https?:\/\/[^"']+)["']/gi)];
    for (const m of wooGallery) { if (images.length < 6) addImg(m[1]); }

    // 3. WooCommerce swiper / flex-viewport images
    const wooFlex = [...html.matchAll(/class=["'][^"']*woocommerce-product-gallery__image[^"']*["'][^>]*>[\s\S]{0,300}?<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi)];
    for (const m of wooFlex) { if (images.length < 6) addImg(m[1]); }

    // 4. Generic product image patterns
    const genericPatterns = [
      /data-src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
      /src=["'](https?:\/\/[^"']+\/(?:uploads|produit|product|image)[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
    ];
    for (const re of genericPatterns) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null && images.length < 6) addImg(m[1]);
    }

    // ── Price ─────────────────────────────────────────────────────────────────
    let price = '';

    // 1. JSON-LD / structured data
    const sdMatch = html.match(/"price"\s*:\s*"?([\d.,]+)"?/);
    if (sdMatch) {
      price = sdMatch[1].replace(',', '.');
    }

    // 2. WooCommerce price span
    if (!price) {
      const wooPrice = html.match(/class=["'][^"']*woocommerce-Price-amount[^"']*["'][^>]*>[\s\S]{0,60}?<bdi[^>]*>([\d\s.,]+)/i);
      if (wooPrice) price = wooPrice[1].replace(/\s/g, '').replace(',', '.');
    }

    // 3. Text patterns: "1,499.000 DT" / "99.90 TND" / "€ 49.99"
    if (!price) {
      const priceRe = /(\d[\d\s.,]*)\s*(?:DT|TND|€|EUR|dinars?)/i;
      const pm = html.match(priceRe);
      if (pm) price = pm[1].replace(/\s/g, '').replace(',', '.');
    }

    return NextResponse.json({ name, description, images, price });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'fetch failed' }, { status: 500 });
  }
}
