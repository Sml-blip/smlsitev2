import { createClient } from "@supabase/supabase-js";
import { ShopPage } from "@/features/shop";

export const dynamic = "force-dynamic";

async function fetchFilterOptions(): Promise<{ categories: string[]; brands: string[] }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase.from("products").select("category, brand");
    const categories = Array.from(new Set((data || []).map((p: any) => p.category).filter(Boolean))) as string[];
    const brands = Array.from(new Set((data || []).map((p: any) => p.brand).filter(Boolean))) as string[];
    return { categories, brands };
  } catch {
    return { categories: [], brands: [] };
  }
}

interface ShopPageTwoRouteProps {
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

export default async function ShopPageTwoRoute({ searchParams }: ShopPageTwoRouteProps) {
  const params = await searchParams;
  const filterOptions = await fetchFilterOptions();
  return (
    <ShopPage
      products={[]}
      page={params.page ?? "1"}
      variant="alternate"
      allCategories={filterOptions.categories}
      allBrands={filterOptions.brands}
    />
  );
}
