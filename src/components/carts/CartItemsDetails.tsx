"use client";
import { Minus, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ProductImage from "@/components/ui/ProductImage";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { getProductUrl } from "@/lib/slugify";

const CartItemsDetails = () => {

  const [isMounted, setIsMounted] = useState(false)

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCartStore();



  useEffect(() => {
    setIsMounted(true)
  }, [])


  if (!isMounted) {
    return null
  }

  if (cartItems?.length === 0) {
    return <div className="text-xl text-center p-2 lg:col-span-2">
      Désolé, votre panier est vide
    </div>
  }

  return (
    <div className="space-x-2 lg:col-span-2" >
      {cartItems?.map((item) => (
        <div
          key={item?.id}
          className="flex flex-wrap items-center justify-between gap-1 md:gap-2 border-b border-gray-300 dark:border-gray-500 py-4 !m-0"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800">
              <ProductImage
                src={item?.images?.[0]}
                alt={item?.name || "Product"}
                fill
                className="object-cover"
              />
            </div>
            <Link href={getProductUrl(item)} className="text-xl font-semibold text-gray-900 dark:text-white hover:opacity-60">
              {item?.name?.slice(0, 30)}...
            </Link>
          </div>
          <p className="border rounded-md border-green-400 py-1 px-2  text-xl text-green-500">
            {formatPrice(item?.price)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              disabled={item?.quantity === 1}
              onClick={() => updateQuantity(item?.id, item?.quantity - 1)}
              size={"sm"}
              variant={"outline"}
            >
              <Minus />
            </Button>
            <p>{item.quantity}</p>
            <Button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              size={"sm"}
              variant={"outline"}
            >
              <Plus />
            </Button>
          </div>

          <div>
            <Button
              onClick={() => removeFromCart(item.id)}
              variant={"destructive"}
            >
              <X />
            </Button>
          </div>
        </div>
      ))}
      {cartItems?.length >= 1 && (
        <Button variant={'outline'} className="my-2" onClick={clearCart}>Vider le panier</Button>
      )}
    </div>
  );
};

export default CartItemsDetails;
