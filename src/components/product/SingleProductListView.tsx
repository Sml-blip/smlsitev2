"use client";
import React from "react";
import RatingReview from "../others/RatingReview";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import AddToWishlistBtn from "../buttons/AddToWishlistBtn";
import AddToCartBtn from "../buttons/AddToCartBtn";
import { Product } from "@/types";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { getProductUrl } from "@/lib/slugify";

const SingleProductListView = ({ product }: { product: Product }) => {
  const { category, discount, images, name, price, rating, reviews } =
    product;

  const discountPrice = calculateDiscount(price, discount);

  return (
    <Link
      href={getProductUrl(product)}
      className="group flex flex-col lg:flex-row lg:items-start items-center justify-center gap-4 relative space-y-4 p-4 md:p-8 border"
    >
      <div className="flex-shrink-0 w-[20rem] h-[18rem] relative rounded-md overflow-hidden bg-gray-200 dark:bg-neutral-800">
        <ProductImage src={images?.[0]} alt={name} fill className="object-contain" />
      </div>
      <div className="">
        <p className="text-sm text-sky-500 font-light">{category}</p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold hover:text-green-500">
            {name.slice(0, 45)}
            {name.length > 45 && "..."}
          </h3>
        </div>
        <RatingReview rating={rating} review={reviews?.length || 0} />
        <div className="text-lg font-bold space-x-2 my-4 ">
          {discount > 0 && (
            <span className="line-through text-muted-foreground">{price} TND</span>
          )}
          <span className="text-xl font-bold text-green-500">
            {discountPrice} TND
          </span>
        </div>
        <div className=" text-sm">
          {product.description.slice(0, 150)}...
        </div>
        <div
          className="flex flex-col md:flex-row mt-4 items-center gap-2 max-w-96 ml-auto justify-end"
          onClick={(e) => e.preventDefault()}
        >
          <AddToWishlistBtn product={product} />
          <AddToCartBtn
            product={{ ...product, quantity: 1, selectedColor: "" }}
          />
        </div>
      </div>
    </Link>
  );
};

export default SingleProductListView;
