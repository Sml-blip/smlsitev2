"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

const XiaomiBanner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchXiaomiProducts();
  }, []);

  const fetchXiaomiProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or('name.ilike.%xiaomi%,brand.ilike.%xiaomi%')
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching Xiaomi products:', error);
      // Fallback to any products if no Xiaomi found
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .limit(4);
        setProducts(data || []);
      } catch {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-black via-neutral-900 to-black">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <span className="inline-block px-4 py-1 bg-primary text-black text-sm font-semibold rounded-full mb-4">
              Collection Spéciale
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Découvrez nos
              <span className="text-primary block mt-2">Meilleurs Produits</span>
            </h2>
            <p className="text-white/70 text-lg mb-6 max-w-md mx-auto lg:mx-0">
              Qualité premium, prix imbattables. Explorez notre sélection des produits les plus populaires.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-black font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Voir la collection <ArrowRight size={20} />
            </Link>
          </div>

          {/* Right Products Grid */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug || product.id}`}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-primary/50 transition-all hover:scale-105"
              >
                <div className="relative w-full h-32 mb-3">
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-primary font-bold mt-2">
                  {product.price} TND
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default XiaomiBanner;
