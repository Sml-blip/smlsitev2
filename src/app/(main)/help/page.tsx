import ContactForm from '@/components/forms/ContactForm';
import React from 'react';

const HelpPage = () => {
  return (
    <div className="px-4 py-8 lg:px-16 lg:py-12 bg-gradient-to-b from-white via-yellow-50/30 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8">
          Centre d&apos;aide
        </h1>
        <div className="bg-white border border-yellow-100 shadow-sm p-6 rounded-lg mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Questions fréquemment posées</h2>
          <div className="space-y-4">
            {/* FAQ Item */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comment puis-je suivre ma commande ?</h3>
              <p className="text-gray-700">Vous pouvez suivre votre commande en accédant à la section &apos;Mes commandes&apos; de votre compte.</p>
            </div>
            {/* Repeat above structure for more FAQ items */}
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
};

export default HelpPage;
