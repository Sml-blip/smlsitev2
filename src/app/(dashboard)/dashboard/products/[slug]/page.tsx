"use client";

import React, { useEffect, useState, use } from "react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import { supabase } from "@/lib/supabase";
import BreadcrumbComponent from "@/components/others/Breadcrumb";
import { Product } from "@/types";
import Loader from "@/components/others/Loader";

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

const ProductDetailsPage = ({ params }: ProductDetailsPageProps) => {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const transformedProduct = {
            ...data,
            images: data.images || [data.image],
            stockItems: data.stock || 0,
            color: data.colors || []
          };
          setProduct(transformedProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto p-8 bg-white rounded-lg shadow-md">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="py-2">
        <BreadcrumbComponent
          links={["/dashboard", "/products"]}
          pageText={product?.name || ''}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:gap-8">
        <ProductGallery isInModal={false} images={product.images} />
        <ProductDetails product={product} />
      </div>
    </div>
  );
};

export default ProductDetailsPage;
