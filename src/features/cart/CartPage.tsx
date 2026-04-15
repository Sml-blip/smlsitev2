"use client";
import CartItemsDetails from "@/components/carts/CartItemsDetails";
import OrderSummaryForCart from "@/components/carts/OrderSummaryForCart";
import BreadcrumbComponent from "@/components/others/Breadcrumb";
import { Separator } from "@/components/ui/separator";
import React from "react";

const CartPage = () => {
  return (
    <section className="p-4 md:p-8 bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Mon Panier
          </h1>
          <BreadcrumbComponent links={["/cart"]} pageText="Mon Panier" />
          <Separator />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          <CartItemsDetails />
          <OrderSummaryForCart />
        </div>
      </div>
    </section>
  );
};

export default CartPage;
