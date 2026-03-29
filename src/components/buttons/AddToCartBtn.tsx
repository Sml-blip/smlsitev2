'use client'
import React, { useState } from "react";
import { Button } from "../ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";

import useCartStore from "@/store/cartStore";
import { showToast } from "@/lib/showToast";
import { CartItem } from "@/types";


const AddToCartBtn = ({ product }: { product: CartItem }) => {
  const { addToCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)


  const handleAddToCart = () => {
    setIsLoading(true)
    // Simulating a small network delay for better UX "preloader" feel
    setTimeout(() => {
      addToCart(product)
      showToast('Article ajouté au panier', product.images[0] as string, product.name)
      setIsLoading(false)
    }, 500)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="w-full p-8 rounded-full text-xl hover:ring-2 ring-slate-500 flex items-center gap-4"
    >
      {" "}
      {isLoading ? <Loader2 className="animate-spin" /> : <ShoppingBag />}
      {isLoading ? "Ajout..." : "Ajouter au panier"}
    </Button>
  );
};

export default AddToCartBtn;
