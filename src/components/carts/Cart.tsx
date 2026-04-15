"use client";
import { ShoppingBag, X, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import { showToast } from "@/lib/showToast";
import { CartItem } from "@/types";
import { formatPrice } from "@/lib/formatPrice";

const Cart = () => {
  const { cartItems, getTotalItems, removeFromCart, getTotalPrice, updateQuantity } = useCartStore();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.id);
    showToast("Article retiré du panier", item?.images?.[0] as string, item.name);
  };

  const hasItems = isMounted && cartItems.length > 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 hover:bg-yellow-50 duration-200 rounded-md mt-1"
        aria-label="Ouvrir le panier"
      >
        <ShoppingBag size={24} />
        {isMounted && getTotalItems() > 0 && (
          <span className="absolute -top-0.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-black text-[10px] font-bold rounded-full px-1">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-900">Mon Panier</h2>
            {isMounted && cartItems.length > 0 && (
              <span className="bg-primary text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {!isMounted || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center">
                <ShoppingBag size={36} className="text-yellow-400" />
              </div>
              <p className="text-gray-500 font-medium">Votre panier est vide</p>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-semibold rounded-full text-sm hover:bg-yellow-400 transition-colors"
              >
                Découvrir la boutique
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                {/* Image */}
                <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
                  <ProductImage
                    src={item?.images?.[0]}
                    alt={item?.name || "produit"}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {item.name}
                  </p>
                  <p className="text-primary font-bold text-sm">
                    {formatPrice(item.price)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-yellow-50 disabled:opacity-40 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-yellow-50 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item)}
                  className="self-start p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {hasItems && (
          <div className="border-t border-yellow-100 px-5 py-4 space-y-3 bg-white">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Sous-total</span>
              <span className="font-bold text-gray-900">{formatPrice(getTotalPrice())}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-primary text-black font-bold rounded-full hover:bg-yellow-400 transition-colors text-sm"
              >
                <ArrowRight size={16} />
                Passer à la caisse
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors text-sm"
              >
                <ShoppingBag size={15} />
                Voir le panier
              </Link>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 text-gray-400 hover:text-gray-600 font-medium transition-colors text-sm"
              >
                Ajouter un produit
                <Plus size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
