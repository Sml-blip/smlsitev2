import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pingGoogleIndexing } from '@/lib/googleIndexing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const category       = searchParams.get('category');
    const brand          = searchParams.get('brand');
    const parentCategory = searchParams.get('parent_category');

    let query = supabase.from('products').select('*');

    if (search && search.trim()) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category && category.trim()) {
      query = query.eq('category', category.trim());
    }
    if (brand && brand.trim()) {
      query = query.eq('brand', brand.trim());
    }
    if (parentCategory && parentCategory.trim()) {
      query = query.eq('parent_category', parentCategory.trim());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[\/\.]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const slug = generateSlug(body.name);

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug: slug,
        price: parseFloat(body.price),
        category: body.category,
        parent_category: body.parent_category || null,
        brand: body.brand || 'Generic',
        description: body.description || '',
        discount: body.discount || 0,
        stock_items: body.stockItems || 10,
        images: body.images || [],
        color: body.color || [],
        about_item: body.about_item || (body.aboutItem ? [body.aboutItem] : []),
        featured: body.featured || false,
        rating: 5
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sml.boutique';
      pingGoogleIndexing(`${siteUrl}/shop/${data.slug}`);

      return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
