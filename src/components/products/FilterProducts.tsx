"use client";
import React, { useState } from "react";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

interface FilterProductsProps {
  allCategories: string[];
  allBrands: string[];
  selectedCategory?: string;
  selectedBrand?: string;
}

const FilterProducts = ({
  allCategories,
  allBrands,
  selectedCategory = "",
  selectedBrand = "",
}: FilterProductsProps) => {
  const [maxValue, setMaxValue] = useState(5000);
  const [minValue, setMinValue] = useState(10);

  // Build a clean /shop URL with the given params
  const shopUrl = (params: Record<string, string | null>) => {
    const p = new URLSearchParams();
    p.set("page", "1");
    // Keep current selections unless overridden
    if (selectedCategory) p.set("category", selectedCategory);
    if (selectedBrand) p.set("brand", selectedBrand);
    // Apply overrides
    for (const [k, v] of Object.entries(params)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    return `/shop?${p.toString()}`;
  };

  const categoryHref = (cat: string) =>
    shopUrl({ category: cat === selectedCategory ? null : cat, brand: null });

  const brandHref = (brand: string) =>
    shopUrl({ brand: brand === selectedBrand ? null : brand, category: null });

  return (
    <aside className="w-72 p-2 space-y-4">
      <h2 className="text-xl font-bold capitalize my-2">Filtrer les produits</h2>
      <Separator />

      {/* Price */}
      <div>
        <h3 className="text-lg font-medium my-2">Par Prix</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="min">Min (TND) :</Label>
            <Input
              id="min"
              placeholder="10 TND"
              value={minValue}
              min={2}
              type="number"
              onChange={(e) => setMinValue(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="max">Max (TND) :</Label>
            <Input
              id="max"
              placeholder="2000 TND"
              min={2}
              value={maxValue}
              type="number"
              onChange={(e) => setMaxValue(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex items-center justify-center flex-wrap">
          <Input
            type="range"
            min={5}
            max={5000}
            value={maxValue}
            onChange={(e) => setMaxValue(Number(e.target.value))}
          />
          <p className="text-center text-primary text-2xl font-bold">{maxValue} TND</p>
        </div>
      </div>

      {/* Categories */}
      {allCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-medium my-2">Par Catégories</h3>
          <div className="flex items-center justify-start gap-2 flex-wrap">
            {allCategories.map((cat) => (
              <a
                key={cat}
                href={categoryHref(cat)}
                className={cn(
                  "px-4 py-1 rounded-full bg-muted cursor-pointer text-sm no-underline",
                  cat === selectedCategory && "bg-primary text-black"
                )}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {allBrands.length > 0 && (
        <div>
          <h3 className="text-lg font-medium my-2">Par Marques</h3>
          <div className="flex items-center justify-start gap-2 flex-wrap">
            {allBrands.map((brand) => (
              <a
                key={brand}
                href={brandHref(brand)}
                className={cn(
                  "px-4 py-1 rounded-full bg-muted cursor-pointer text-sm no-underline",
                  brand === selectedBrand && "bg-primary text-black"
                )}
              >
                {brand}
              </a>
            ))}
          </div>
        </div>
      )}

      <a href="/shop?page=1">
        <Button variant="outline" className="w-full">
          Effacer le filtre
        </Button>
      </a>
    </aside>
  );
};

export default FilterProducts;
