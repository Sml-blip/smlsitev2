import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingGoogleIndexing } from '@/lib/googleIndexing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

      const { data, error } = await supabase
        .from('products')
        .update({
          name: body.name,
          price: parseFloat(body.price),
          category: body.category,
          brand: body.brand,
          description: body.description,
          discount: body.discount || 0,
          stock_items: body.stockItems || 10,
          images: body.images || [],
          colors: body.colors || body.color || [],
          about_item: body.aboutItem ? [body.aboutItem] : [],
          featured: body.featured || false,
          updated_at: new Date().toISOString()
        })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

      if (data?.slug) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sml.boutique';
        pingGoogleIndexing(`${siteUrl}/shop/${data.slug}`);
      }

      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
