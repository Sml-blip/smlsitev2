"use client";
import HomePageChart from "@/components/dashboard/charts/HomePageChart";
import ProductOverviewChart from "@/components/dashboard/charts/ProductOverviewChart";
import RecentOrdersSection from "@/components/dashboard/order/RecentOrders";
import StatisticsCard from "@/components/dashboard/statistics/StatisticsCard";
import { Activity, DollarSign, ShoppingBag, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  items: any[];
  status: string;
  date: string;
}

const DashboardPage = () => {
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

  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce((acc, order) => {
    if (Array.isArray(order.items)) {
      return acc + order.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    }
    return acc;
  }, 0);

  const uniqueCustomers = new Set(orders.map(o => o.customerName)).size;

  if (loading) return null;

  return (
    <section className="max-w-screen-xl mx-auto py-4">
      <div className="grid gap-2 lg:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard
          iconColor="bg-rose-500"
          title="Chiffre d'affaires"
          value={`${totalRevenue.toFixed(2)} TND`}
          icon={DollarSign}
        />
        <StatisticsCard
          iconColor="bg-lime-500"
          title="Articles Vendus"
          value={totalItemsSold.toString()}
          icon={ShoppingBag}
        />
        <StatisticsCard
          iconColor="bg-rose-500"
          title="Commandes"
          value={totalOrders.toString()}
          icon={Activity}
        />
        <StatisticsCard
          iconColor="bg-violet-500"
          title="Clients"
          value={uniqueCustomers.toString()}
          icon={Users}
        />
      </div>
      <HomePageChart />
      <RecentOrdersSection />
      <ProductOverviewChart />
    </section>
  );
};

export default DashboardPage;
