import OrderSummaryForCheckout from "@/components/carts/OrderSummaryForCheckout";
import CheckoutForm from "@/components/forms/CheckoutForm";
import CouponCodeForm from "@/components/forms/CouponCodeForm";
import { Separator } from "@/components/ui/separator";
import React from "react";

const CheckoutPage = () => {
  return (
    <section className="px-4 py-4 lg:px-16 bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Paiement
          </h1>
          <p className="text-gray-600">Veuillez remplir le formulaire ci-dessous pour finaliser votre commande.</p>
          <Separator className="mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white border border-yellow-100 shadow-sm p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
