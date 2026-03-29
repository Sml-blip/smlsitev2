"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Eye, Loader2, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  zip?: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface OrderActionsProps {
  order: Order;
  onStatusChange?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  "En attente": { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  "En traitement": { label: "En traitement", color: "bg-blue-100 text-blue-800", icon: Package },
  "Expédié": { label: "Expédié", color: "bg-purple-100 text-purple-800", icon: Truck },
  "Livré": { label: "Livré", color: "bg-green-100 text-green-800", icon: CheckCircle },
  "Annulé": { label: "Annulé", color: "bg-red-100 text-red-800", icon: XCircle },
};

const OrderActions = ({ order, onStatusChange }: OrderActionsProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      if (error) throw error;
      
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Annuler cette commande ?")) return;
    await handleStatusChange("Annulé");
  };

  const status = statusConfig[currentStatus] || statusConfig["En attente"];

  return (
    <div>
      <Popover>
        <PopoverTrigger className="">
          <div className="flex items-center justify-center hover:bg-slate-200 p-2 rounded-full dark:hover:bg-slate-900 duration-200">
            <MoreHorizontal />
          </div>
        </PopoverTrigger>
        <PopoverContent className="text-start w-56">
          <button
            onClick={() => setShowDetails(true)}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900 text-left flex items-center gap-2"
          >
            <Eye size={16} />
            Voir les détails
          </button>
          <div className="py-2 px-4">
            <span className="text-xs text-muted-foreground mb-1 block">Changer le statut</span>
            <Select 
              value={currentStatus} 
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <config.icon size={14} />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button 
            onClick={handleCancel}
            disabled={updating || currentStatus === "Annulé"}
            className="w-full text-start hover:bg-red-100 dark:hover:bg-red-900/30 py-2 px-4 rounded-md text-red-600 disabled:opacity-50"
          >
            {updating ? "Mise à jour..." : "Annuler la commande"}
          </button>
        </PopoverContent>
      </Popover>

      {/* Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Commande #{order.orderNumber}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Client</h3>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.email}</p>
                {order.phone && <p className="text-sm text-muted-foreground">{order.phone}</p>}
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Adresse de livraison</h3>
                <p className="text-sm">{order.address || "Non spécifiée"}</p>
                <p className="text-sm">{[order.city, order.zip].filter(Boolean).join(", ") || "-"}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Articles ({order.items?.length || 0})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qté: {item.quantity} × {item.price} TND
                      </p>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} TND</p>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">
                {Number(order.total || 0).toFixed(2)} TND
              </span>
            </div>

            {/* Status Change Buttons */}
            <div>
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Mettre à jour le statut</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(key)}
                      disabled={updating || currentStatus === key}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all
                        ${currentStatus === key 
                          ? `${config.color} ring-2 ring-offset-2 ring-current` 
                          : "bg-muted hover:bg-muted/80"
                        }
                        disabled:opacity-50
                      `}
                    >
                      {updating && currentStatus !== key ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Icon size={14} />
                      )}
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-muted-foreground pt-4 border-t">
              Commandé le {order.date}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderActions;
