"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import useCartStore from "@/store/cartStore";

const CheckoutBtn = () => {
  const cartItems = useCartStore((s) => s.cartItems);
  const hasItems = cartItems.length > 0;

  if (!hasItems) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-3 my-2 text-xl bg-gray-200 text-gray-400 py-3 px-8 rounded-full cursor-not-allowed"
      >
        <ArrowRight /> Passer à la caisse
      </button>
    );
  }

  return (
    <Link
      href={"/checkout"}
      className="w-full flex items-center justify-center gap-3 my-2 text-xl bg-primary text-primary-foreground py-3 px-8 rounded-full hover:bg-yellow-500 focus:outline-none"
    >
      <ArrowRight /> Passer à la caisse
    </Link>
  );
};

export default CheckoutBtn;
