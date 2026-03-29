import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sml.boutique";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

    const { data: categories } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null);

    const { data: brands } = await supabase
      .from("products")
      .select("brand")
      .not("brand", "is", null);

    const uniqueCategories = [...new Set((categories || []).map((c: any) => c.category))];
    const uniqueBrands = [...new Set((brands || []).map((b: any) => b.brand))];

    const categoryPages: MetadataRoute.Sitemap = uniqueCategories.map((cat: string) => ({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(cat)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const brandPages: MetadataRoute.Sitemap = uniqueBrands.map((brand: string) => ({
      url: `${SITE_URL}/shop?brand=${encodeURIComponent(brand)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .not("slug", "is", null);

    const productPages: MetadataRoute.Sitemap = (products || [])
      .filter((p: any) => p.slug)
      .map((p: any) => ({
        url: `${SITE_URL}/shop/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...staticPages, ...categoryPages, ...brandPages, ...productPages];

}
