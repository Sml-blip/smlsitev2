'use client'
import React from "react";
import { Button } from "../ui/button";
import { Product, } from "@/types";
import useWishlistStore from "@/store/wishlistStore";
import { showToast } from "@/lib/showToast";

const AddToWishlistBtn = ({ product }: { product: Product }) => {
  const { addToWishlist, isInWishlist } = useWishlistStore()

  const handleAddToWishList = () => {
    if (isInWishlist(product.id)) {
      showToast('L\'article existe déjà dans les favoris', product.images[0] as string, product.name)
    } else {
      addToWishlist(product);
      showToast('Article ajouté aux favoris', product.images[0] as string, product.name)
    }
  }

  return (
    <Button onClick={(handleAddToWishList)} variant={"outline"} className="w-full p-8 text-xl rounded-full">
      {" "}
      Ajouter aux favoris
    </Button>
  );
};

export default AddToWishlistBtn;
