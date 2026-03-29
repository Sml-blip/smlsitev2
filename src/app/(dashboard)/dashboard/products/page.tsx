"use client";
import ProductHeader from "@/components/dashboard/product/ProductHeader";
import Loader from "@/components/others/Loader";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getProducts } from "@/lib/products";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { Trash2, Loader2, Check, Upload, ArrowUpDown } from "lucide-react";

const PRODUCTS_PER_PAGE = 30;

const CATEGORIES = [
  "ACCESSOIRES",
  "COMPOSANTS",
  "CONSOLES",
  "ECRANS",
  "IMAGE & SON",
  "PC PORTABLE",
  "SÉCURITÉ & PROTECTION",
  "SMARTPHONE ACCESSOIRES",
];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }
    list = [...list].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [products, searchTerm, sortOrder]);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortOrder]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, page * PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  const hasMore = displayedProducts.length < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMore]);

  const handleFieldChange = (productId: number, field: string, value: string | number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async (product: Product) => {
    setSavingId(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: product.name,
          price: product.price,
          category: product.category,
          images: product.images,
          description: product.description,
        })
        .eq("id", product.id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error saving:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSavingId(null);
    }
  };

  const handleImageUpload = async (productId: number, file: File) => {
    setUploadingId(productId);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const newImageUrl = urlData.publicUrl;

      // Update product in database
      const { error: updateError } = await supabase
        .from("products")
        .update({ images: [newImageUrl] })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, images: [newImageUrl] } : p
        )
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erreur lors du téléchargement de l'image");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setDeletingId(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete");
      
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-xl mx-auto w-full bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 my-4">
      <ProductHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Affichage {displayedProducts.length} sur {filteredProducts.length} produits
              {searchTerm && ` (${products.length} total)`}
            </p>
            <button
              onClick={() => setSortOrder((prev) => prev === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-500 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowUpDown size={14} />
              {sortOrder === "newest" ? "Plus récent" : "Plus ancien"}
            </button>
          </div>
        <table className="min-w-full overflow-x-scroll divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-500">
          <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Prix
              </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedProducts.map((product) => (
              <tr key={product.id} className="bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800">
                <td className="px-4 py-2">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[product.id] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(product.id, file);
                      }}
                    />
                    <button
                      onClick={() => fileInputRefs.current[product.id]?.click()}
                      disabled={uploadingId === product.id}
                      className="relative"
                    >
                      {uploadingId === product.id ? (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Loader2 size={16} className="animate-spin text-yellow-500" />
                        </div>
                      ) : (
                        <>
                          <Image
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload size={14} className="text-white" />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleFieldChange(product.id, "name", e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-yellow-500 focus:outline-none rounded px-2 py-1 text-sm text-black dark:text-white"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handleFieldChange(product.id, "price", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-yellow-500 focus:outline-none rounded px-2 py-1 text-sm text-black dark:text-white"
                    />
                    <span className="text-xs text-gray-500">TND</span>
                  </div>
                </td>
                  <td className="px-4 py-2">
                    <select
                      value={product.category || ""}
                      onChange={(e) => handleFieldChange(product.id, "category", e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-yellow-500 focus:outline-none rounded px-2 py-1 text-sm text-black dark:text-white dark:bg-neutral-900"
                    >
                      <option value="">-- Sélectionner --</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 min-w-[200px] max-w-[320px]">
                    <textarea
                      value={product.description || ""}
                      onChange={(e) => handleFieldChange(product.id, "description", e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-yellow-500 focus:outline-none rounded px-2 py-1 text-sm text-black dark:text-white resize-y"
                    />
                  </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSave(product)}
                      disabled={savingId === product.id}
                      className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                      title="Enregistrer"
                    >
                      {savingId === product.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      {deletingId === product.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {displayedProducts.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            Aucun produit trouvé pour &quot;{searchTerm}&quot;
          </div>
        )}
        
        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              Chargement...
            </div>
          )}
          {!hasMore && displayedProducts.length > 0 && (
            <p className="text-gray-500 text-sm">Tous les produits sont affichés</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
