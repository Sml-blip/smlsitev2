"use client";
import React, { useEffect, useState } from "react";
import RatingReview from "../others/RatingReview";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import ProductOptions from "./ProductOptions";
import { Product } from "@/types";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { getProductUrl } from "@/lib/slugify";
import { useRouter } from "next/navigation";

const SingleProductCartView = ({ product }: { product: Product }) => {
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  const {
    category,
    discount,
    images,
    name,
    price,
    rating,
    reviews,
    stockItems,
  } = product;

  const discountedPrice = calculateDiscount(price, discount);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Link
      href={getProductUrl(product)}
      className="relative border border-black/10 dark:border-white/10 rounded-xl overflow-hidden group flex flex-col h-full bg-white dark:bg-black hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
    >
      <div className="w-full bg-white dark:bg-black overflow-hidden">
        <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 group-hover:scale-105 transition-all duration-300 rounded-md overflow-hidden">
          <ProductImage 
            src={images?.[0]} 
            alt={name} 
            fill 
            className="object-contain"
          />
          {discount > 0 && (
              <p className="py-0.5 px-2 md:py-1 md:px-4 text-xs md:text-sm font-bold rounded-sm bg-primary text-black absolute top-1 right-1 md:top-2 md:right-2 z-10">
                -{discount}%
              </p>
            )}
        </div>
      </div>
      <div className="hidden md:group-hover:block slideCartOptions absolute top-16 right-2">
        <ProductOptions product={product} />
      </div>
      <div className="my-1 md:my-2 space-y-0.5 md:space-y-1 p-2 md:p-4 flex-1 flex flex-col">
        <p
          onClick={(e) => {
            e.preventDefault();
            router.push(`shop?category=${category}`);
          }}
          className="text-xs md:text-sm text-primary font-medium -mb-1 hover:opacity-60"
        >
          {category}
        </p>
        <h3 className="text-sm md:text-lg lg:text-xl font-medium capitalize hover:text-primary line-clamp-2 transition-colors">
          {name}
        </h3>
        <div className="hidden md:block">
          <RatingReview rating={rating} review={reviews?.length || 0} />
        </div>
        <div className="text-sm md:text-lg font-bold space-x-1 md:space-x-3 mt-auto pt-1">
          {discount > 0 && (
            <span className="line-through text-muted-foreground text-xs md:text-base">{price} TND</span>
          )}
          <span className="text-base md:text-xl font-bold text-primary">
            {discountedPrice.toFixed(2)} TND
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SingleProductCartView;
