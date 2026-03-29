"use client";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Loader2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
import ProductImage from "@/components/ui/ProductImage";
import { getProductUrl } from "@/lib/slugify";

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data.slice(0, 8));
        setShowDropdown(true);
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
      setShowDropdown(false);
    }
  };

  const handleProductClick = () => {
    setSearchTerm("");
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (pathname !== "/search") {
      setSearchTerm("");
      setShowDropdown(false);
    }
  }, [pathname]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form
        onSubmit={onFormSubmit}
        className="flex items-center border-2 w-full rounded-lg bg-white dark:bg-neutral-900"
      >
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="p-2 rounded-md w-full lg:w-64 border-none outline-none focus:outline-none focus-visible:ring-offset-0 focus-visible:ring-0 text-black dark:text-white"
            placeholder="Rechercher..."
          />
        {searchTerm && (
          <Button
            type="button"
            onClick={clearSearch}
            className="p-1 hover:opacity-50"
            variant="ghost"
            size="sm"
          >
            <X size={16} />
          </Button>
        )}
        <Button
          type="submit"
          className="hover:opacity-30 duration-200"
          variant="link"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </Button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="animate-spin mx-auto" size={24} />
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                  <Link
                    key={product.id}
                    href={getProductUrl(product)}
                    onClick={handleProductClick}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors border-b border-gray-100 dark:border-neutral-800 last:border-b-0"
                >
                  <div className="w-12 h-12 relative flex-shrink-0 bg-gray-100 dark:bg-neutral-800 rounded overflow-hidden">
                    <ProductImage
                      src={product.images?.[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-black dark:text-white">{product.name}</p>
                      <p className="text-sm text-primary font-semibold">
                        {typeof product.price === 'number' ? product.price.toFixed(2) : product.price} TND
                      </p>
                    </div>
                </Link>
              ))}
              {searchTerm && (
                <button
                  onClick={() => {
                    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
                    setShowDropdown(false);
                  }}
                  className="w-full p-3 text-center text-sm text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 font-medium"
                >
                  Voir tous les résultats pour &quot;{searchTerm}&quot;
                </button>
              )}
            </>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              Aucun produit trouvé
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
