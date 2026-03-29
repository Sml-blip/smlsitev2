import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import productsData from '@/data/products/products.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const existingProducts = await supabase.from('products').select('id').limit(1);
    if (existingProducts.data && existingProducts.data.length > 0) {
      return NextResponse.json({ message: 'Products already seeded' }, { status: 200 });
    }

    const products = productsData.slice(0, 100).map((p: any) => ({
      category: p.category,
      brand: p.brand || 'Generic',
      color: p.color || [],
      stock_items: p.stockItems || 10,
      discount: p.discount || 0,
      name: p.name,
      price: p.price,
      description: p.description || '',
      about_item: p.aboutItem || [],
      reviews: p.reviews || [],
      images: typeof p.images === 'string' ? [p.images] : (p.images || []),
      rating: p.rating || 5,
      featured: false
    }));

    const { error } = await supabase.from('products').insert(products);

    if (error) {
      console.error('Seed error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Seeded successfully', count: products.length });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to seed database' });
}
