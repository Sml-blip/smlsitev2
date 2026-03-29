"use client";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "../ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useMobileSearchModal } from "@/store/mobileSearchStore";
import { usePathname, useRouter } from "next/navigation";
import { Product } from "@/types";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { getProductUrl } from "@/lib/slugify";

const MobileSearch = () => {
  const { closeModal, isOpen } = useMobileSearchModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data.slice(0, 6));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
      closeModal();
      setSearchTerm('');
      setResults([]);
    }
  };

  const handleProductClick = () => {
    setSearchTerm("");
    setResults([]);
    closeModal();
  };

  useEffect(() => {
    if (pathname !== "/search") {
      setSearchTerm("");
      setResults([]);
    }
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-800">
        <form
          onSubmit={onFormSubmit}
          className="flex items-center flex-1 gap-2 px-3 rounded-lg border dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900"
        >
          <Search size={20} className="text-gray-400" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none py-3"
          />
          {loading && <Loader2 size={18} className="animate-spin text-gray-400" />}
        </form>
        <Button variant="ghost" size="icon" onClick={closeModal}>
          <X size={24} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.length > 0 ? (
          <div className="divide-y dark:divide-neutral-800">
            {results.map((product) => (
                <Link
                  key={product.id}
                  href={getProductUrl(product)}
                  onClick={handleProductClick}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="w-16 h-16 relative flex-shrink-0 bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <ProductImage
                    src={product.images?.[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-primary font-semibold mt-1">
                    {typeof product.price === 'number' ? product.price.toFixed(2) : product.price} TND
                  </p>
                </div>
              </Link>
            ))}
            {searchTerm && (
              <button
                onClick={() => {
                  router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
                  closeModal();
                  setSearchTerm('');
                  setResults([]);
                }}
                className="w-full p-4 text-center text-primary font-medium hover:bg-gray-50 dark:hover:bg-neutral-900"
              >
                Voir tous les résultats pour &quot;{searchTerm}&quot;
              </button>
            )}
          </div>
        ) : searchTerm.length >= 2 && !loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun produit trouvé pour &quot;{searchTerm}&quot;</p>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>Commencez à taper pour rechercher</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearch;
