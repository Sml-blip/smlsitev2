'use client'
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import useCartStore from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { showToast } from "@/lib/showToast";

const schema = z.object({
  name: z.string().min(3, "Le nom est requis"),
  phone: z.string().min(8, "Le téléphone est requis (ex: 22334455)"),
  address: z.string().min(3, "L'adresse est requise"),
});

type FormData = z.infer<typeof schema>;

const CheckoutForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems, getTotalAmount, clearCart } = useCartStore();
  const hasItems = cartItems.length > 0;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: data.name,
          email: "sml.shop.2024@gmail.com",
          phone: data.phone,
          address: data.address,
          city: "",
          zip: "",
          total: getTotalAmount(),
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedColor: item.selectedColor
          }))
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        const orderNumber = orderData?.orderNumber ?? `ORD-${Date.now()}`;
        // Capture total and items BEFORE clearing cart
        const finalTotal = getTotalAmount();
        sessionStorage.setItem(
          "order-items",
          JSON.stringify(
            cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.images?.[0] ?? "",
            }))
          )
        );
        clearCart();
        const params = new URLSearchParams({
          ref: orderNumber,
          nom: data.name,
          total: String(finalTotal),
          tel: data.phone,
          adresse: data.address,
        });
        router.push(`/commande-confirmee?${params.toString()}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      showToast("Erreur", "", "Une erreur est survenue lors de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            placeholder="Votre nom"
            {...register("name")}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-6 focus:outline-none"
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            type="tel"
            id="phone"
            placeholder="22334455"
            {...register("phone")}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-6 focus:outline-none"
          />
          {errors.phone && (
            <span className="text-red-500">{errors.phone.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            placeholder="rue de tunis, Tunis"
            {...register("address")}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-6 focus:outline-none"
          />
          {errors.address && (
            <span className="text-red-500">{errors.address.message}</span>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isLoading || !hasItems} className="gap-2">
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {isLoading ? "Traitement..." : "Commander"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
