import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AuditIssue = {
  type: 'error' | 'warning' | 'ok';
  message: string;
};

export type ProductAudit = {
  id: string | number;
  name: string;
  slug: string;
  score: number;
  issues: AuditIssue[];
};

function auditProduct(p: any): ProductAudit {
  const issues: AuditIssue[] = [];

  // Description checks
  if (!p.description || p.description.trim().length === 0) {
    issues.push({ type: 'error', message: 'Description manquante' });
  } else if (p.description.trim().length < 120) {
    issues.push({ type: 'warning', message: `Description trop courte (${p.description.trim().length} chars, min 120)` });
  } else {
    issues.push({ type: 'ok', message: 'Description OK' });
  }

  // Name checks
  if (!p.name || p.name.trim().length < 10) {
    issues.push({ type: 'warning', message: 'Nom de produit trop court pour le SEO (min 10 chars)' });
  } else {
    issues.push({ type: 'ok', message: 'Nom OK' });
  }

  // Images check
  if (!p.images || p.images.length === 0) {
    issues.push({ type: 'error', message: 'Aucune image' });
  } else {
    issues.push({ type: 'ok', message: `${p.images.length} image(s)` });
  }

  // Slug check
  if (!p.slug || p.slug.trim().length === 0) {
    issues.push({ type: 'error', message: 'Slug manquant' });
  } else if (/[A-Z\s]/.test(p.slug)) {
    issues.push({ type: 'warning', message: 'Slug contient des majuscules ou espaces' });
  } else {
    issues.push({ type: 'ok', message: 'Slug OK' });
  }

  // Category check
  if (!p.category || p.category.trim().length === 0) {
    issues.push({ type: 'error', message: 'Catégorie manquante' });
  } else {
    issues.push({ type: 'ok', message: 'Catégorie OK' });
  }

  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const total = issues.length;
  const score = Math.max(0, Math.round(((total - errors * 2 - warnings) / total) * 100));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    score,
    issues,
  };
}

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, description, images, category')
      .order('name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const audits = (products || []).map(auditProduct);

    const totalScore = audits.length
      ? Math.round(audits.reduce((sum, a) => sum + a.score, 0) / audits.length)
      : 0;

    const errorCount = audits.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'error').length, 0);
    const warningCount = audits.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'warning').length, 0);

    return NextResponse.json({ totalScore, errorCount, warningCount, audits });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
