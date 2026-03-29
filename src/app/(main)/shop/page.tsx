import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { ShopPage } from "@/features/shop";
import { Product } from "@/types";

// Never serve this page from cache — always run the server component fresh
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sml.boutique";

// ── Server-side product fetch with filters ──────────────────────────────────
async function fetchProducts(params: {
  category?: string;
  brand?: string;
  search?: string;
  color?: string;
  min?: string;
  max?: string;
}): Promise<Product[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase.from("products").select("*");

    if (params.search?.trim())   query = query.ilike("name", `%${params.search.trim()}%`);
    if (params.category?.trim()) query = query.eq("category", params.category.trim());
    if (params.brand?.trim())    query = query.eq("brand", params.brand.trim());

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    let products: Product[] = (data || []).map((p: any) => ({
      ...p,
      images: p.images || [],
      stockItems: p.stock_items || 0,
      color: p.color || [],
    }));

    // Color and price range: client can't do these server-side easily, keep here
    if (params.color) {
      products = products.filter((p) => p.color?.includes(params.color!));
    }
    if (params.min && params.max) {
      const lo = parseFloat(params.min);
      const hi = parseFloat(params.max);
      products = products.filter((p) => {
        const price = typeof p.price === "string" ? parseFloat(p.price) : p.price;
        return price >= lo && price <= hi;
      });
    }

    return products;
  } catch (err) {
    console.error("fetchProducts error:", err);
    return [];
  }
}

// ── Fetch all distinct categories + brands (for sidebar chips) ───────────────
async function fetchFilterOptions(): Promise<{ categories: string[]; brands: string[] }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase.from("products").select("category, brand");
    const cats  = Array.from(new Set((data || []).map((p: any) => p.category).filter(Boolean))) as string[];
    const brands = Array.from(new Set((data || []).map((p: any) => p.brand).filter(Boolean))) as string[];
    return { categories: cats, brands };
  } catch {
    return { categories: [], brands: [] };
  }
}

// ── Route ───────────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    brand?: string;
    search?: string;
    min?: string;
    max?: string;
    color?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const { category, brand, search } = params;

  let title = "Boutique Informatique & Bureautique | SML Informatique Tunisie";
  let description = "Découvrez notre catalogue complet de matériel informatique : ordinateurs, laptops, imprimantes et accessoires. Meilleurs prix en Tunisie chez SML Informatique.";

  if (category) {
    title = `${category} au Meilleur Prix en Tunisie | SML Informatique`;
    description = `Achetez votre ${category} en Tunisie. Découvrez notre sélection aux meilleurs prix. Livraison rapide et garantie officielle.`;
  } else if (brand) {
    title = `Produits ${brand} Tunisie | Boutique SML Informatique`;
    description = `Retrouvez tous les produits de la marque ${brand} en Tunisie chez SML Informatique.`;
  } else if (search) {
    title = `Résultats pour "${search}" | SML Informatique`;
    description = `Résultats pour votre recherche "${search}" sur SML Informatique Tunisie.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/shop${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    },
  };
}

export default async function ShopPageRoute({ searchParams }: PageProps) {
  const params = await searchParams;

  // Run both fetches in parallel
  const [products, filterOptions] = await Promise.all([
    fetchProducts(params),
    fetchFilterOptions(),
  ]);

  return (
    <ShopPage
      products={products}
      page={params.page ?? "1"}
      allCategories={filterOptions.categories}
      allBrands={filterOptions.brands}
      selectedCategory={params.category ?? ""}
      selectedBrand={params.brand ?? ""}
    />
  );
}
