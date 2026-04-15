import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  // Try to create the gallery table via raw SQL using RPC
  const sql = `
    CREATE TABLE IF NOT EXISTS gallery (
      id bigserial PRIMARY KEY,
      image_url text NOT NULL,
      product_slug text,
      product_id bigint,
      alt text DEFAULT '',
      position integer DEFAULT 0,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS gallery_position_idx ON gallery(position);
  `;

  let error: unknown = null;
  try {
    const result = await supabase.rpc('exec_sql', { sql });
    error = result.error;
  } catch { error = 'rpc not available'; }

  if (error) {
    // RPC may not exist — just return instructions
    return NextResponse.json({
      note: 'Run this SQL in your Supabase dashboard → SQL Editor',
      sql,
    });
  }

  return NextResponse.json({ ok: true });
}
