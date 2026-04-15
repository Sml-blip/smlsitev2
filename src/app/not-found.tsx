import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { OctagonX } from 'lucide-react';

const NotFound = () => {
    return (
        <div className='w-full min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-b from-white via-yellow-50/30 to-white px-4'>
            <div className="text-center space-y-4">
                <OctagonX size={80} className="text-red-500 mx-auto" />
                <h2 className='text-4xl font-bold text-gray-900'>Page non trouvée !</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <Link href="/">
                    <Button size="lg" className="mt-4">
                        Retour à l'accueil
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
