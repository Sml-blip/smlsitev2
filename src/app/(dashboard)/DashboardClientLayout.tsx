"use client";

import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";

const DASHBOARD_PIN = "53577426";
const PIN_STORAGE_KEY = "dashboard_pin_verified";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already verified in this session
    const verified = sessionStorage.getItem(PIN_STORAGE_KEY);
    if (verified === "true") {
      setIsVerified(true);
    }
    setLoading(false);
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DASHBOARD_PIN) {
      sessionStorage.setItem(PIN_STORAGE_KEY, "true");
      setIsVerified(true);
      setError(false);
    } else {
      setError(true);
      setPin("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-yellow-500/30">
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-full bg-black flex items-center justify-center"
              style={{
                boxShadow: "0 0 30px 8px rgba(255, 204, 0, 0.4)",
                border: "3px solid #FFCC00",
              }}
            >
              <Lock size={36} className="text-yellow-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">
            Accès Administrateur
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Entrez le code PIN pour accéder au tableau de bord
          </p>
          
          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setError(false);
              }}
              placeholder="Code PIN"
              className={`w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono rounded-lg border-2 
                ${error ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"} 
                focus:outline-none focus:border-yellow-500 dark:bg-neutral-800 dark:text-white`}
              autoFocus
            />
            
            {error && (
              <p className="text-red-500 text-center mt-2 text-sm">
                Code PIN incorrect
              </p>
            )}
            
            <button
              type="submit"
              className="w-full mt-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row gap-2 md:px-8">
        <DashboardSidebar />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
