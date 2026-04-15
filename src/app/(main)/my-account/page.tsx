"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import useOrderStore from '@/store/orderStore';
import { formatPrice } from '@/lib/formatPrice';

const MyAccountPage = () => {
  const { orders } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="px-4 py-8 lg:px-16 lg:py-12 bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8">
          Mon compte
        </h1>
        <div className="bg-white border border-yellow-100 shadow-sm p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <p className="text-gray-800">Clients Invité</p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <p className="text-gray-800">guest@example.com</p>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white border border-yellow-100 shadow-sm p-6 rounded-lg">
          <div className='flex items-center justify-between'>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Adresse</h2>
            <Link href={'/my-account/edit'} className='p-2 rounded-md border border-yellow-200 hover:bg-yellow-50'>Modifier l&apos;adresse</Link>
          </div>

          <div>
            <p className="text-gray-800">123 Rue Principale</p>
            <p className="text-gray-800">Tunis, Tunisie</p>
          </div>
        </div>
        <div className="mt-8 bg-white border border-yellow-100 shadow-sm p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Historique des commandes</h2>
          <div>
            {orders.length === 0 ? (
              <p>Aucune commande passée.</p>
            ) : orders.map((order) => (
              <div key={order.id} className="border-t border-gray-200 py-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">Commande #{order.orderNumber}</p>
                  <p className="text-gray-800">{formatPrice(order.total)}</p>
                </div>
                <p className="text-gray-500">Date : {order.date}</p>
                <p className="text-gray-500">Statut : {order.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
