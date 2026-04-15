"use client";

import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Phone, Search, Package, ChevronDown, ChevronUp, Loader2, ShoppingBag } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  "En attente":   "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Confirmée":    "bg-blue-100 text-blue-700 border-blue-200",
  "En livraison": "bg-orange-100 text-orange-700 border-orange-200",
  "Livrée":       "bg-green-100 text-green-700 border-green-200",
  "Annulée":      "bg-red-100 text-red-700 border-red-200",
};

const OrderCard = ({ order }: { order: Order }) => {
  const [expanded, setExpanded] = useState(false);
  const statusClass = statusColors[order.status] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="bg-white border border-yellow-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-yellow-500" />
            <span className="font-bold text-gray-900 text-sm tracking-wide">{order.orderNumber}</span>
          </div>
          <p className="text-xs text-gray-400">{order.date} · {order.customerName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusClass}`}>
            {order.status}
          </span>
          <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
            {order.total.toLocaleString("fr-TN")} TND
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-full hover:bg-yellow-50 transition-colors text-gray-400"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable items */}
      {expanded && (
        <div className="border-t border-yellow-50 px-5 py-4 space-y-3 bg-yellow-50/30">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Articles</p>
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-gray-700 flex-1 line-clamp-1">{item.name}</span>
              <span className="text-gray-400 text-xs">×{item.quantity}</span>
              <span className="font-semibold text-gray-800 whitespace-nowrap">
                {(item.price * item.quantity).toLocaleString("fr-TN")} TND
              </span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between text-sm font-bold text-gray-900">
            <span>Total</span>
            <span>{order.total.toLocaleString("fr-TN")} TND</span>
          </div>
          {order.address && (
            <p className="text-xs text-gray-400 pt-1">📍 {order.address}</p>
          )}
        </div>
      )}
    </div>
  );
};

const MyOrdersPage = () => {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data: Order[] = await res.json();
      setOrders(data);
      setSearched(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/30 to-white px-4 py-10 lg:px-16">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-50 border border-yellow-200 mb-2">
            <ShoppingBag size={26} className="text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
          <p className="text-gray-500 text-sm">Entrez votre numéro de téléphone pour retrouver vos commandes</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white border border-yellow-100 shadow-sm rounded-2xl p-6 space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Numéro de téléphone
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ex. 22334455"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Rechercher
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <Package size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Aucune commande trouvée</p>
                <p className="text-gray-400 text-sm">Vérifiez le numéro saisi ou passez votre première commande.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 font-medium">
                  {orders.length} commande{orders.length > 1 ? "s" : ""} trouvée{orders.length > 1 ? "s" : ""}
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
