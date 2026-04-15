"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Phone,
  MapPin,
  Receipt,
  Clock,
  Truck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

const SML_WHATSAPP = "21648028729";

// WhatsApp SVG icon
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const ConfirmationContent = () => {
  const params = useSearchParams();
  const orderNumber = params.get("ref") ?? "—";
  const customerName = params.get("nom") ?? "";
  const total = params.get("total") ?? "";
  const phone = params.get("tel") ?? "";
  const address = params.get("adresse") ?? "";

  const [items, setItems] = useState<OrderItem[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [redirected, setRedirected] = useState(false);

  // Build the pre-filled WhatsApp message
  const itemsText = items.length > 0
    ? items.map((i) => `  • ${i.name} x${i.quantity} — ${(i.price * i.quantity).toLocaleString("fr-TN")} TND`).join("\n")
    : "";

  const waMessage = encodeURIComponent(
    `Bonjour SML Informatique 👋\n\n` +
    `Je confirme ma commande *${orderNumber}*\n\n` +
    (itemsText ? `🛒 Articles :\n${itemsText}\n\n` : "") +
    `👤 Nom : ${customerName}\n` +
    `📞 Téléphone : ${phone}\n` +
    `📍 Adresse : ${address}\n` +
    `💰 Total : ${Number(total).toLocaleString("fr-TN")} TND\n\n` +
    `Merci !`
  );

  const waUrl = `https://wa.me/${SML_WHATSAPP}?text=${waMessage}`;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("order-items");
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // 5-second countdown then redirect to WhatsApp
  useEffect(() => {
    if (redirected) return;
    if (countdown <= 0) {
      setRedirected(true);
      window.location.href = waUrl;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, redirected, waUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/30 to-white flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-4">

        {/* ── Success header card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={38} className="text-green-500" strokeWidth={1.8} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Commande confirmée !
          </h1>
          {customerName && (
            <p className="text-gray-500 text-sm mb-3">
              Merci, <span className="font-semibold text-gray-700">{customerName}</span>
            </p>
          )}
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Votre commande a bien été enregistrée. Vous allez être redirigé vers WhatsApp pour la confirmer.
          </p>

          {/* Order number pill */}
          <div className="inline-flex items-center gap-2 mt-5 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
            <Receipt size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Référence :</span>
            <span className="text-xs font-mono font-bold text-gray-800">{orderNumber}</span>
          </div>
        </div>

        {/* ── WhatsApp CTA (main action) ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#25D366]/30 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-[#25D366] transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>

          <div className="px-6 py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
              <WhatsAppIcon size={30} />
            </div>

            <div>
              <p className="font-semibold text-gray-800 text-base">
                Confirmez via WhatsApp
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {countdown > 0
                  ? `Redirection automatique dans ${countdown} seconde${countdown > 1 ? "s" : ""}…`
                  : "Ouverture de WhatsApp…"}
              </p>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 active:scale-95"
              style={{ backgroundColor: "#25D366" }}
              onClick={() => setRedirected(true)}
            >
              <WhatsAppIcon size={18} />
              Ouvrir WhatsApp maintenant
            </a>

            <button
              onClick={() => setRedirected(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
            >
              Passer cette étape
            </button>
          </div>
        </div>

        {/* ── Products overview ── */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Récapitulatif des articles ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate leading-snug">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString("fr-TN")} TND
                  </p>
                </li>
              ))}
            </ul>

            {/* Shipping row */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Truck size={15} className="text-orange-500" />
                Frais de livraison
              </span>
              <span className="text-sm font-semibold text-orange-500">+ 8,00 TND</span>
            </div>

            {/* Total row */}
            {total && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {Number(total).toLocaleString("fr-TN")} TND
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Delivery info ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {phone && (
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Phone size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Téléphone</p>
                <p className="text-sm font-medium text-gray-800">{phone}</p>
              </div>
            </div>
          )}
          {address && (
            <div className="flex items-start gap-3 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Adresse de livraison</p>
                <p className="text-sm font-medium text-gray-800">{address}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Statut</p>
              <p className="text-sm font-medium text-amber-600">En attente de confirmation</p>
            </div>
          </div>
        </div>

        {/* ── Continue shopping ── */}
        <Link
          href="/shop"
          className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200 text-sm shadow-sm"
        >
          <ShoppingBag size={16} />
          Continuer mes achats
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <p className="text-center text-gray-300 text-xs pb-4">
          SML Informatique · Tunis, Tunisie
        </p>
      </div>
    </div>
  );
};

const CommandeConfirmeePage = () => (
  <Suspense>
    <ConfirmationContent />
  </Suspense>
);

export default CommandeConfirmeePage;
