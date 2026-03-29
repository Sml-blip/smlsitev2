"use client";

import ProductGallery from "@/components/product/ProductGallery";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState, use } from "react";
import RelatedProducts from "@/components/products/RelatedProducts";
import BreadcrumbComponent from "@/components/others/Breadcrumb";
import ProductDetails from "@/components/product/ProductDetails";
import { Product } from "@/types";
import Loader from "@/components/others/Loader";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const ProductPage = ({ params }: ProductPageProps) => {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
        try {
          setLoading(true);

          let productData: Product | null = null;

          const numericId = Number(slug);
          if (!isNaN(numericId) && String(numericId) === slug) {
            // Numeric ID lookup
            const { data } = await supabase.from('products').select('*').eq('id', numericId).maybeSingle();
            productData = data;
          } else {
            // Try exact slug match first
            const { data: exact } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
            productData = exact;

            // Fallback: normalize the slug (strip accents, clean special chars) and try again
            if (!productData) {
              const { generateSlug } = await import('@/lib/slugify');
              const normalizedSlug = generateSlug(decodeURIComponent(slug));
              if (normalizedSlug !== slug) {
                const { data: normalized } = await supabase.from('products').select('*').eq('slug', normalizedSlug).maybeSingle();
                productData = normalized;
              }
            }
          }

        if (productData) {
          const transformedProduct = {
            ...productData,
            images: productData.images || [productData.image],
            stockItems: productData.stock || 0,
            color: productData.colors || []
          };
          setProduct(transformedProduct);

          const { data: related, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', productData.category)
            .neq('id', productData.id)
            .limit(4);

          if (relatedError) throw relatedError;

          const transformedRelated = (related || []).map(product => ({
            ...product,
            images: product.images || [product.image],
            stockItems: product.stock || 0,
            color: product.colors || []
          }));

          setRelatedProducts(transformedRelated);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 flex flex-col items-start gap-2 min-h-screen">
      <div className="my-2">
        <BreadcrumbComponent links={["/shop"]} pageText={product?.name!} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <ProductGallery isInModal={false} images={product?.images!} />
        <ProductDetails product={product!}/>
      </div>
      <RelatedProducts products={relatedProducts} />
    </div>
  );
};

export default ProductPage;
