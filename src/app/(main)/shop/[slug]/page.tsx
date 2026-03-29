import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductPageClient from "./ProductPageClient";
// ProductPageClient is the "use client" version of this page

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sml.boutique";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string) {
  const numericId = Number(slug);
  if (!isNaN(numericId) && String(numericId) === slug) {
    const { data } = await supabaseServer
      .from("products")
      .select("id, name, description, slug, category, brand, images, price, created_at, updated_at")
      .eq("id", numericId)
      .maybeSingle();
    return data;
  }
  const { data: exact } = await supabaseServer
    .from("products")
    .select("id, name, description, slug, category, brand, images, price, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (exact) return exact;

  const { generateSlug } = await import("@/lib/slugify");
  const normalizedSlug = generateSlug(decodeURIComponent(slug));
  if (normalizedSlug !== slug) {
    const { data: normalized } = await supabaseServer
      .from("products")
      .select("id, name, description, slug, category, brand, images, price, created_at, updated_at")
      .eq("slug", normalizedSlug)
      .maybeSingle();
    return normalized;
  }
  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productData = await fetchProduct(slug);

  if (!productData) {
    return {
      title: "Produit introuvable",
      description: "Ce produit n'existe pas ou a été retiré.",
    };
  }

  const productSlug = productData.slug || slug;
  const productName = productData.name as string;
  const description =
    (productData.description as string) ||
    `Achetez ${productName} au meilleur prix en Tunisie sur SML Informatique.`;
  const pageUrl = `${SITE_URL}/shop/${productSlug}`;
  const rawImage = Array.isArray(productData.images) ? productData.images[0] : null;
  const imageUrl: string =
    rawImage && rawImage.startsWith("http") ? rawImage : `${SITE_URL}/og-image.png`;

  const titleSuffix = productData.brand ? ` — ${productData.brand}` : "";
  const fullTitle = `${productName}${titleSuffix}`;

  return {
    title: fullTitle,
    description: description.slice(0, 160),
    keywords: [
      productName,
      productData.brand,
      productData.category,
      "tunisie",
      "prix",
      "SML informatique",
    ].filter(Boolean) as string[],
    openGraph: {
      type: "article",
      url: pageUrl,
      title: `${fullTitle} | SML Informatique`,
      description: description.slice(0, 160),
      publishedTime: productData.created_at,
      modifiedTime: productData.updated_at || productData.created_at,
      authors: [`${SITE_URL}/about`],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: productName,
          type: imageUrl.endsWith(".png") ? "image/png" : "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullTitle} | SML Informatique`,
      description: description.slice(0, 160),
      images: [{ url: imageUrl, alt: productName }],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  let jsonLd: object | null = null;
  if (product) {
    const productSlug = product.slug || slug;
    const rawImage = Array.isArray(product.images) ? product.images[0] : null;
    const imageUrl: string =
      rawImage && rawImage.startsWith("http") ? rawImage : `${SITE_URL}/og-image.png`;

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: imageUrl,
      brand: product.brand
        ? { "@type": "Brand", name: product.brand }
        : undefined,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/shop/${productSlug}`,
        priceCurrency: "TND",
        price: product.price,
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "SML Informatique" },
      },
      inLanguage: "fr-TN",
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient params={params} />
    </>
  );
}
