"use client";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useState } from "react";
import ProductImport from "./ProductImport";
import BackgroundRemover from "./BackgroundRemover";
import BackupManager from "./BackupManager";
import ImageLocalizer from "./ImageLocalizer";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DELETION_CODE = "SUPPRIMER-TOUT-2024";

interface ProductHeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

const ProductHeader = ({ searchTerm = "", onSearchChange }: ProductHeaderProps) => {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");

  const handleDeleteAll = async () => {
    if (confirmCode !== DELETION_CODE) {
      setError("Code de confirmation incorrect!");
      return;
    }

    setDeleting(true);
    setError("");
    
    try {
      const response = await fetch('/api/products/delete-all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode: confirmCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        window.location.reload();
      } else {
        setError(data.error || 'Failed to delete products');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowConfirm(false);
    setConfirmCode("");
    setError("");
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Produits
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Input 
              placeholder="Rechercher un produit..." 
              className="p-5 rounded-md w-full lg:w-64 text-black dark:text-white"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          <BackupManager />
          <ImageLocalizer />
          <BackgroundRemover />
          <Button
            variant="outline"
            onClick={() => setShowConfirm(true)}
            className="border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer tout
          </Button>
          <ProductImport />
          <Link
            href="/dashboard/products/add-product"
            className="px-4 py-2 text-sm font-semibold text-black bg-primary hover:bg-primary/80 rounded-lg whitespace-nowrap"
          >
            Nouveau Produit
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal with Code */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-black border-2 border-red-500 rounded-xl shadow-2xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">ATTENTION - Zone Dangereuse</h3>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Cette action est <strong>IRRÉVERSIBLE</strong>. Tous les produits seront définitivement supprimés de la base de données.
            </p>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Pour confirmer, tapez le code ci-dessous:
              </p>
              <code className="block bg-white dark:bg-black px-3 py-2 rounded border font-mono text-lg tracking-wider text-center">
                {DELETION_CODE}
              </code>
            </div>

            <Input
              type="text"
              placeholder="Entrez le code de confirmation..."
              value={confirmCode}
              onChange={(e) => {
                setConfirmCode(e.target.value.toUpperCase());
                setError("");
              }}
              className={`mb-4 font-mono tracking-wider ${error ? 'border-red-500' : ''}`}
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeleteAll}
                disabled={deleting || confirmCode !== DELETION_CODE}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer définitivement
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductHeader;
