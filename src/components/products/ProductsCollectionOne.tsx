"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import SingleProductCartView from "../product/SingleProductCartView";

const PAGE_SIZE = 8;

const ProductsCollectionOne = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    fetchProducts(0, true);
  }, []);

  const fetchProducts = async (pageIndex: number, initial = false) => {
    try {
      initial ? setLoading(true) : setLoadingMore(true);

      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const transformed = (products || []).map((p) => ({
        ...p,
        images: p.images || [p.image],
        stockItems: p.stock || 0,
        color: p.colors || [],
      }));

      setData((prev) => (initial ? transformed : [...prev, ...transformed]));
      setHasMore((products || []).length === PAGE_SIZE);
      setPage(pageIndex);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchProducts(page + 1);
  };

  if (!isMounted) return null;

  if (loading) {
    return (
      <section className="max-w-screen-xl mx-auto py-16 px-4 md:px-8 w-full">
        <div className="text-center">Chargement des produits...</div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-xl mx-auto py-16 px-4 md:px-8 w-full">
      <Tabs defaultValue="top-rated" className="w-full space-y-8 mx-0">
        <div className="flex items-center flex-col md:flex-row justify-between gap-2 flex-wrap w-full">
          <h2 className="text-3xl md:text-5xl font-semibold border-l-4 border-l-primary p-2">
            Produits en vedette
          </h2>
          <TabsList className="font-semibold bg-transparent text-center">
            <TabsTrigger value="top-rated" className="md:text-xl">
              Mieux notés
            </TabsTrigger>
            <TabsTrigger value="most-popular" className="md:text-xl">
              Plus populaires
            </TabsTrigger>
            <TabsTrigger value="new-items" className="md:text-xl">
              Nouveaux articles
            </TabsTrigger>
          </TabsList>
        </div>

        {(["top-rated", "most-popular", "new-items"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {data.map((product) => (
                <SingleProductCartView key={product.id} product={product} />
              ))}
            </div>
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="relative flex items-center gap-2 px-10 py-3 rounded-full bg-black text-white font-bold text-base overflow-hidden disabled:opacity-60 group"
                    style={{ isolation: "isolate" }}
                  >
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, #facc15, #f59e0b, #fbbf24, #eab308, #facc15)",
                        backgroundSize: "300% 100%",
                        animation: "gradientShift 2.5s linear infinite",
                        padding: "2px",
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />
                    {loadingMore ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-yellow-400" />
                        <span>Chargement...</span>
                      </>
                    ) : (
                      <span>Voir plus</span>
                    )}
                    <style>{`
                      @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 300% 50%; }
                      }
                    `}</style>
                  </button>
                </div>
              )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default ProductsCollectionOne;
