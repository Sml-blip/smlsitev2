"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

import React, { useEffect, useState } from "react";
import SingleProductCartView from "../product/SingleProductCartView";

const ProductsCollectionTwo = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      const transformedProducts = (products || []).map(product => ({
        ...product,
        images: product.images || [product.image],
        stockItems: product.stock || 0,
        color: product.colors || []
      }));

      setData(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-screen-xl mx-auto py-16 px-4 md:px-8 w-full">
        <div className="text-center">Loading products...</div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-xl mx-auto py-16 px-4 md:px-8 w-full">
      <Tabs defaultValue="new-arrivals" className="w-full space-y-8 mx-0">
        <TabsList className="font-semibold bg-transparent w-full text-center">
          <TabsTrigger value="new-arrivals" className="md:text-xl">
            Nouvelles arrivées
          </TabsTrigger>
          <TabsTrigger value="best-sellers" className="md:text-xl">
            Meilleures ventes
          </TabsTrigger>
          <TabsTrigger value="feauted" className="md:text-xl">
            En vedette
          </TabsTrigger>
        </TabsList>
        <TabsContent value="new-arrivals" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {data?.slice(0, 8)?.map((product) => {
              return (
                <SingleProductCartView key={product.id} product={product} />
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="best-sellers">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.slice(0, 8)?.map((product) => {
              return (
                <SingleProductCartView key={product.id} product={product} />
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="feauted">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.slice(0, 8)?.map((product) => {
              return (
                <SingleProductCartView key={product.id} product={product} />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default ProductsCollectionTwo;
