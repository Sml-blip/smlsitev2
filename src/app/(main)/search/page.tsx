"use client";

import BreadcrumbComponent from "@/components/others/Breadcrumb";
import SingleProductCartView from "@/components/product/SingleProductCartView";
import SingleProductListView from "@/components/product/SingleProductListView";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import Loader from "@/components/others/Loader";

const SearchComponent = ({
  searchParams,
}: {
  searchParams: { query: string };
}) => {
  const [foundProducts, setFoundProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${searchParams.query}%`);

        if (error) throw error;

        const transformedProducts = (data || []).map(product => ({
          ...product,
          images: product.images || [product.image],
          stockItems: product.stock || 0,
          color: product.colors || []
        }));

        setFoundProducts(transformedProducts);
      } catch (error) {
        console.error('Error searching products:', error);
        setFoundProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchParams.query]);

  if (loading) {
    return <Loader />;
  }

  if (foundProducts.length === 0) {
    return <div className="text-xl font-medium flex flex-col items-center justify-center h-screen w-full">
      <p className="p-4 text-center" >Sorry, no search result found for your query !</p>
      <Link className="p-2 underline text-muted-foreground" href={'/'}>Home</Link>
    </div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <BreadcrumbComponent links={["/shop"]} pageText={searchParams.query!} />
      <p className=" capitalize">{foundProducts.length} results found for your search <span className="text-lg font-medium">
      {searchParams.query}</span></p>
      </div>
      <div className="hidden lg:grid grid-cols-1 gap-6">
        {foundProducts.map((product) => (
          <SingleProductListView key={product.id} product={product}/>
        ))}
      </div>
      <div className="grid lg:hidden grid-cols-1 md:grid-cols-3 gap-6">
        {foundProducts.map((product) => (
          <SingleProductCartView key={product.id} product={product}/>
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;
