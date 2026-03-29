'use client';
import { create } from "zustand";

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    date: string;
    status: "En attente" | "Expédié" | "Livré" | "Annulé";
    total: number;
    items: any[];
}

interface OrderState {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateStatus: (id: string, status: Order["status"]) => void;
    deleteOrder: (id: string) => void;
}

const STORAGE_KEY = "sml-store-orders";

const useOrderStore = create<OrderState>((set) => {
    const isLocalStorageAvailable = typeof window !== "undefined" && window.localStorage;
    const initialOrders = isLocalStorageAvailable ? localStorage.getItem(STORAGE_KEY) : null;
    const parsedOrders: Order[] = initialOrders ? JSON.parse(initialOrders) : [];

    return {
        orders: parsedOrders,

        addOrder: (newOrder: Order) => {
            set((state) => {
                const updatedOrders = [newOrder, ...state.orders];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
                return { orders: updatedOrders };
            });
        },

        updateStatus: (id: string, status: Order["status"]) => {
            set((state) => {
                const updatedOrders = state.orders.map((order) =>
                    order.id === id ? { ...order, status } : order
                );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
                return { orders: updatedOrders };
            });
        },

        deleteOrder: (id: string) => {
            set((state) => {
                const updatedOrders = state.orders.filter((order) => order.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
                return { orders: updatedOrders };
            });
        },
    };
});

export default useOrderStore;
