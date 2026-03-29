import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeoTask = 'title' | 'description' | 'keywords' | 'alt' | 'full' | 'longtail' | 'schema';

export interface SeoAiRequest {
  prompt: string;
  task?: SeoTask;
  context?: {
    productName?: string;
    category?: string;
    currentTitle?: string;
    currentDescription?: string;
    keywords?: string[];
    url?: string;
  };
}

export interface SeoAiResponse {
  result: string;
  task: SeoTask;
  confidence: number;
  tokens: number;
  durationMs: number;
}

// ─── System prompts per task ──────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<SeoTask, string> = {
  title: `You are an expert SEO copywriter specialized in e-commerce in Tunisia (French + Arabic market).
Generate a compelling, click-worthy meta title.
Rules:
- Length: 50–60 characters exactly
- Include the main keyword naturally at the start
- Add a benefit or USP (e.g., prix, livraison, qualité)
- No clickbait, no ALL CAPS
- Output ONLY the title, no quotes, no explanation`,

  description: `You are an expert SEO copywriter specialized in e-commerce in Tunisia.
Generate a meta description that drives clicks from Google search results.
Rules:
- Length: 140–160 characters exactly
- Include the primary keyword + 1 secondary keyword
- Add a call-to-action (e.g., "Commandez maintenant", "Livraison rapide")
- Mention Tunisia/Tunisie to target local search
- Output ONLY the description text, no quotes, no explanation`,

  keywords: `You are an SEO keyword research expert for Tunisian e-commerce.
Generate a focused list of SEO keywords in French (and occasionally Arabic transcription).
Rules:
- Return exactly 10 keywords/phrases
- Mix: 3 broad terms, 4 mid-tail (2-3 words), 3 long-tail (4+ words)
- Include price intent terms (e.g., "prix", "pas cher", "tunisie")
- One keyword per line, no numbering, no bullets, no explanation`,

  longtail: `You are an SEO long-tail keyword specialist for Tunisian e-commerce.
Generate long-tail search queries that real customers type in Google Tunisia.
Rules:
- Return exactly 8 long-tail phrases (4+ words each)
- Focus on buyer-intent queries (acheter, prix, meilleur, comparatif)
- Include location variants (tunisie, tunis, sfax, sousse)
- One phrase per line, no numbering, no explanation`,

  alt: `You are an image SEO specialist.
Write an optimal alt text for a product image.
Rules:
- Length: 80–125 characters
- Describe what's in the image + include the product name + main keyword
- Be descriptive, natural language (not keyword-stuffed)
- Output ONLY the alt text, no quotes`,

  schema: `You are a structured data / JSON-LD expert for e-commerce SEO.
Generate a complete, valid Schema.org Product JSON-LD snippet.
Rules:
- Use @type: Product with all required properties
- Include name, description, image, brand, offers (with price, priceCurrency TND, availability)
- Add aggregateRating if possible
- Output ONLY the raw JSON-LD object (no <script> tags, no explanation)`,

  full: `You are a senior SEO strategist for a Tunisian e-commerce store selling tech & computer hardware.
Provide a complete SEO analysis and optimization for the given product/page.
Return a structured JSON object with these exact keys:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["...", ...],
  "longtailKeywords": [...],
  "altText": "...",
  "improvements": ["...", ...],
  "score": 0-100
}
Output ONLY the JSON object, no markdown code blocks, no explanation.`,
};

// ─── Confidence heuristic ─────────────────────────────────────────────────────

function estimateConfidence(result: string, task: SeoTask): number {
  if (!result || result.length < 5) return 10;
  if (task === 'title') {
    const len = result.trim().length;
    return len >= 50 && len <= 60 ? 95 : len >= 40 && len <= 70 ? 80 : 60;
  }
  if (task === 'description') {
    const len = result.trim().length;
    return len >= 140 && len <= 160 ? 95 : len >= 120 && len <= 180 ? 80 : 60;
  }
  if (task === 'keywords' || task === 'longtail') {
    const lines = result.trim().split('\n').filter(Boolean);
    return lines.length >= 8 ? 90 : lines.length >= 5 ? 75 : 55;
  }
  if (task === 'schema') {
    try { JSON.parse(result); return 90; } catch { return 50; }
  }
  if (task === 'full') {
    try { JSON.parse(result); return 92; } catch { return 65; }
  }
  return 80;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen3:0.6b';
const TIMEOUT_MS = 60_000;

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: SeoAiRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prompt, task = 'full', context } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 1) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

  // Build enriched user message
  let userMessage = prompt;
  if (context) {
    const parts: string[] = [];
    if (context.productName)        parts.push(`Product: ${context.productName}`);
    if (context.category)           parts.push(`Category: ${context.category}`);
    if (context.currentTitle)       parts.push(`Current title: ${context.currentTitle}`);
    if (context.currentDescription) parts.push(`Current description: ${context.currentDescription}`);
    if (context.keywords?.length)   parts.push(`Existing keywords: ${context.keywords.join(', ')}`);
    if (context.url)                parts.push(`URL: ${context.url}`);
    if (parts.length > 0) {
      userMessage = `${parts.join('\n')}\n\nTask: ${prompt}`;
    }
  }

  const systemPrompt = SYSTEM_PROMPTS[task] ?? SYSTEM_PROMPTS.full;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        options: {
          temperature: 0.4,
          top_p: 0.9,
          num_predict: 512,
          num_thread: 4,
        },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      return NextResponse.json(
        { error: `Ollama error ${ollamaRes.status}: ${errText}` },
        { status: 502 }
      );
    }

    const data = await ollamaRes.json();
    const rawResult: string = data?.message?.content ?? '';
    const totalTokens: number = (data?.prompt_eval_count ?? 0) + (data?.eval_count ?? 0);
    const durationMs = Date.now() - start;

    // Strip Qwen3 <think>...</think> reasoning block if present
    const result = rawResult.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    const response: SeoAiResponse = {
      result,
      task,
      confidence: estimateConfidence(result, task),
      tokens: totalTokens,
      durationMs,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as Error;
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Ollama timeout — model is too slow or not running. Check OLLAMA_BASE_URL.' },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── GET — Health check ───────────────────────────────────────────────────────

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const models: string[] = data?.models?.map((m: { name: string }) => m.name) ?? [];
    const ready = models.some((m) => m.includes('qwen3'));
    return NextResponse.json({ status: ready ? 'ready' : 'model_not_found', models });
  } catch {
    return NextResponse.json({ status: 'ollama_offline' }, { status: 503 });
  }
}
