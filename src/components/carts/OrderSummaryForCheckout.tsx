"use client";
import React, { useEffect, useState } from "react";
import CartItemsDetails from "./CartItemsDetails";
import { Separator } from "../ui/separator";
import useCartStore from "@/store/cartStore";
import { Button } from "../ui/button";
import Loader from "../others/Loader";
import { formatPrice } from "@/lib/formatPrice";
import { Truck } from "lucide-react";

const OrderSummaryForCheckout = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { getTotalPrice, getShippingFee, getTotalAmount } =
    useCartStore();

  if (!isMounted) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg">
      {/* ordered items details */}
      <div>
        <h2 className="text-lg font-semibold my-2 lg:p-4">Articles</h2>
        <CartItemsDetails />
        <Separator className="dark:bg-white/50 mb-2" />
      </div>

      {/* order summary for order place */}
      <div className="lg:px-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Résumé de la commande
        </h2>
        <div className="flex justify-between mb-4">
          <span className="text-gray-700 dark:text-gray-300">Sous-total:</span>
          <span className="text-gray-900 dark:text-white">
            {formatPrice(getTotalPrice())}
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Truck size={16} className="text-orange-500" />
            Frais de livraison
          </span>
          <span className="font-semibold text-orange-500">+ {formatPrice(getShippingFee())}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            Total:
          </span>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatPrice(getTotalAmount())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryForCheckout;
