"use client";

import OrderActions from "@/components/dashboard/order/OrderActions";
import OrderSearch from "@/components/dashboard/order/OrderSearch";
import Loader from "@/components/others/Loader";
import Pagination from "@/components/others/Pagination";
import React, { Suspense, useEffect, useState } from "react";

interface Order {
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

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-xl mx-auto w-full bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 my-4 ">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white ">
          Commandes
        </h2>
        <OrderSearch />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-500 rounded-md">
          <thead className="bg-gray-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 ">
            {orders.length === 0 ? (
              <tr className="bg-white dark:bg-neutral-900">
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Aucune commande trouvée.</td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="bg-white dark:bg-neutral-900">
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "Expédié"
                      ? "bg-green-100 text-green-800"
                      : order.status === "En attente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                      }`}
                  >
                    {order.status}
                  </span>
                </td>
<td className="px-6 py-4 whitespace-nowrap">
                    <OrderActions order={order} onStatusChange={fetchOrders} />
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Suspense fallback={<Loader />}>
          <Pagination currentPage={1} pageName="orderpage" totalPages={Math.ceil(orders.length / 10) || 1} />
        </Suspense>
      </div>
    </div>
  );
};

export default OrdersPage;
