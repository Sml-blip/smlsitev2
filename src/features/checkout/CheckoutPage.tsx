import OrderSummaryForCheckout from "@/components/carts/OrderSummaryForCheckout";
import CheckoutForm from "@/components/forms/CheckoutForm";
import CouponCodeForm from "@/components/forms/CouponCodeForm";
import { Separator } from "@/components/ui/separator";
import React from "react";

const CheckoutPage = () => {
  return (
    <section className="px-4 py-4 lg:px-16  bg-white dark:bg-neutral-900">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white ">
            Paiement
          </h1>
          <p>Veuillez remplir le formulaire ci-dessous pour finaliser votre commande.</p>
          <Separator className="dark:bg-white/50 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Adresse de livraison
              </h2>
              <CheckoutForm />
            </div>
            <CouponCodeForm />
          </div>
          <OrderSummaryForCheckout />
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
