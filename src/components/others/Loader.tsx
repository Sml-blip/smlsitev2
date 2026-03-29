"use client";
import { ShoppingBag } from 'lucide-react';
import React from 'react';

const Loader = () => {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <ShoppingBag size={48} className="text-primary/50" />
            </div>
            <div className="relative animate-bounce">
              <ShoppingBag size={48} className="text-primary drop-shadow-lg" />
            </div>
            <div className="absolute -inset-4 rounded-full bg-primary/20 animate-pulse blur-xl" />
          </div>
          
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        
        <p className="text-sm font-medium text-black dark:text-white tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;
