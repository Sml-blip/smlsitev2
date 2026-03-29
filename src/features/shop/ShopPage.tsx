"use client";

import FilterProducts from "@/components/products/FilterProducts";
import ShopPageContainer from "@/components/products/ShopPageContainer";
import Loader from "@/components/others/Loader";
import React, { Suspense, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

export type ShopPageVariant = "default" | "alternate";

interface ShopPageProps {
  products: Product[];
  page?: string;
  variant?: ShopPageVariant;
  allCategories?: string[];
  allBrands?: string[];
  selectedCategory?: string;
  selectedBrand?: string;
}

const ShopPage = ({ products, page = "1", allCategories = [], allBrands = [], selectedCategory = "", selectedBrand = "" }: ShopPageProps) => {
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  return (
    <div className="w-full bg-gray-50 dark:bg-black min-h-screen">
      <div className="mx-auto max-w-7xl px-2 md:px-8 py-4 md:py-8">

        {/* Mobile filter button */}
        <div className="xl:hidden mb-4">
          <Button
            onClick={() => setShowMobileFilter(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <SlidersHorizontal size={18} />
            Filtrer les produits
          </Button>
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilter(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-black overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b dark:border-neutral-800">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilter(false)}>
                  <X size={24} />
                </Button>
              </div>
              <Suspense fallback={<Loader />}>
                <FilterProducts allCategories={allCategories} allBrands={allBrands} selectedCategory={selectedCategory} selectedBrand={selectedBrand} />
              </Suspense>
            </div>
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <div className="hidden xl:block w-72 flex-shrink-0 sticky top-24">
            <Suspense fallback={<Loader />}>
              <FilterProducts allCategories={allCategories} allBrands={allBrands} selectedCategory={selectedCategory} selectedBrand={selectedBrand} />
            </Suspense>
          </div>

          {/* Products — already filtered by server */}
          <div className="flex-1 min-w-0">
            <ShopPageContainer products={products} page={page} gridColumn={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
