import { NextRequest, NextResponse } from 'next/server';
import { fileGetAll, fileInsert, fileDelete, fileUpdate } from '@/lib/galleryStore';

export async function GET() {
  const items = fileGetAll();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { image_url, product_slug, product_id, alt } = body;

  if (!image_url) {
    return NextResponse.json({ error: 'image_url required' }, { status: 400 });
  }

  const items = fileGetAll();
  const position = (items[items.length - 1]?.position ?? 0) + 1;

  const newItem = fileInsert({
    image_url,
    product_slug: product_slug || null,
    product_id: product_id || null,
    alt: alt || '',
    position,
  });

  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updated = fileUpdate(Number(id), patch);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  fileDelete(Number(id));
  return NextResponse.json({ ok: true });
}
