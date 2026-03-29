import ContactForm from '@/components/forms/ContactForm';
import React from 'react';

const HelpPage = () => {
  return (
    <div className="px-4 py-8 lg:px-16 lg:py-12 bg-gray-100 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Centre d'aide
        </h1>
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Questions fréquemment posées</h2>
          <div className="space-y-4">
            {/* FAQ Item */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Comment puis-je suivre ma commande ?</h3>
              <p className="text-gray-700 dark:text-gray-300">Vous pouvez suivre votre commande en accédant à la section 'Mes commandes' de votre compte.</p>
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
