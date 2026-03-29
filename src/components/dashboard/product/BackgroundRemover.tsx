"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ImageIcon, Loader2, X, CheckCircle, AlertCircle,
  Play, Pause, RotateCcw, Undo2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  images: string[];
}

interface ProcessingLog {
  type: "info" | "success" | "error" | "progress";
  message: string;
  product?: string;
}

const BackgroundRemover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const pausedRef = useRef(false);
  const abortRef = useRef(false);

  const addLog = (log: ProcessingLog) => {
    setLogs(prev => [...prev.slice(-50), log]);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, images")
      .not("images", "is", null);

    if (error) {
      addLog({ type: "error", message: `Erreur: ${error.message}` });
      return [];
    }

    // Filter products that need processing (not already processed)
    const needsProcessing = data?.filter(
      (p) => p.images && p.images.length > 0 && 
        !p.images[0]?.includes("supabase.co") &&
        !p.images[0]?.includes("replicate.delivery")
    ) || [];

    return needsProcessing;
  };

  const fetchImageViaProxy = async (imageUrl: string): Promise<Blob | null> => {
    try {
      // Use our proxy API to bypass CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        console.error(`Proxy fetch failed: ${response.status}`);
        return null;
      }
      
      return await response.blob();
    } catch (error) {
      console.error("Proxy fetch error:", error);
      return null;
    }
  };

  const processImage = async (imageUrl: string): Promise<Blob | null> => {
    try {
      // Fetch image via proxy to bypass CORS
      const imageBlob = await fetchImageViaProxy(imageUrl);
      if (!imageBlob) {
        console.error("Failed to fetch image via proxy");
        return null;
      }

      // Dynamically import the library (client-side only)
      const { removeBackground } = await import("@imgly/background-removal");
      
      // Process with imgly
      const resultBlob = await removeBackground(imageBlob, {
        debug: false,
        proxyToWorker: true,
        model: "small", // Use small model for faster processing
      });

      return resultBlob;
    } catch (error) {
      console.error("Error processing image:", error);
      return null;
    }
  };

  const uploadToSupabase = async (blob: Blob, productId: number): Promise<string | null> => {
    try {
      const fileName = `product-${productId}-nobg-${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const startProcessing = async () => {
    setProcessing(true);
    setPaused(false);
    pausedRef.current = false;
    abortRef.current = false;
    setLogs([]);
    
    addLog({ type: "info", message: "🚀 Démarrage du traitement..." });
    addLog({ type: "info", message: "📦 Chargement de la bibliothèque IA..." });

    const productsToProcess = await fetchProducts();
    setProgress({ current: 0, total: productsToProcess.length });

    if (productsToProcess.length === 0) {
      addLog({ type: "info", message: "✅ Aucun produit à traiter!" });
      setProcessing(false);
      return;
    }

    addLog({ type: "info", message: `📋 ${productsToProcess.length} produits à traiter` });

    let processed = 0;
    let failed = 0;

    for (let i = 0; i < productsToProcess.length; i++) {
      if (abortRef.current) {
        addLog({ type: "info", message: "⏹️ Traitement annulé" });
        break;
      }

      while (pausedRef.current && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const product = productsToProcess[i];
      setProgress({ current: i + 1, total: productsToProcess.length });
      
      addLog({ type: "progress", message: `⏳ ${product.name}`, product: product.name });

      try {
        const originalImage = product.images[0];
        const processedBlob = await processImage(originalImage);
        
        if (processedBlob) {
          const newImageUrl = await uploadToSupabase(processedBlob, product.id);
          
          if (newImageUrl) {
            // IMPORTANT: Only update the images array, don't delete or modify other fields
            const updatedImages = [newImageUrl, ...product.images.slice(1)];
            
            const { error: updateError } = await supabase
              .from("products")
              .update({ images: updatedImages })
              .eq("id", product.id);

            if (updateError) {
              addLog({ type: "error", message: `❌ ${product.name}: DB error`, product: product.name });
              failed++;
            } else {
              addLog({ type: "success", message: `✅ ${product.name}`, product: product.name });
              processed++;
            }
          } else {
            addLog({ type: "error", message: `❌ ${product.name}: Upload failed`, product: product.name });
            failed++;
          }
        } else {
          addLog({ type: "error", message: `⚠️ ${product.name}: Process failed`, product: product.name });
          failed++;
        }
      } catch (error) {
        addLog({ type: "error", message: `❌ ${product.name}: ${error}`, product: product.name });
        failed++;
      }
    }

    addLog({ type: "info", message: `🎉 Terminé! ${processed} traités, ${failed} échoués` });
    setProcessing(false);
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    addLog({ type: "info", message: pausedRef.current ? "⏸️ En pause..." : "▶️ Reprise..." });
  };

  const stopProcessing = () => {
    abortRef.current = true;
    pausedRef.current = false;
    setPaused(false);
  };

  const progressPercent = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  const [restoring, setRestoring] = useState(false);

  const restoreOriginals = async () => {
    setRestoring(true);
    try {
      const res = await fetch("/api/products/restore-images", { method: "POST" });
      const data = await res.json();
      if (data.restored > 0) {
        toast.success(`${data.restored} images restaurées`, {
          description: `${data.failed} échecs. Rechargez la page pour voir les changements.`,
        });
      } else {
        toast.info("Aucune image nobg trouvée", {
          description: "Toutes les images semblent déjà originales.",
        });
      }
    } catch {
      toast.error("Erreur lors de la restauration");
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="border-primary text-black dark:text-white hover:bg-primary hover:text-black"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Auto BG Remove
        </Button>
        <Button
          variant="outline"
          onClick={restoreOriginals}
          disabled={restoring}
          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
        >
          {restoring
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <Undo2 className="w-4 h-4 mr-2" />}
          Restaurer originaux
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-black border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold">Suppression d&apos;arrière-plan</h2>
              <p className="text-xs text-white/60">Traitement IA local (sans limites)</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (processing) stopProcessing();
              setIsOpen(false);
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="px-4 py-3 bg-black/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">
                {progress.current} / {progress.total}
              </span>
              <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="h-80 overflow-y-auto p-4 bg-black font-mono text-sm space-y-1">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <ImageIcon className="w-12 h-12 mb-3" />
              <p>Cliquez sur &quot;Démarrer&quot; pour commencer</p>
              <p className="text-xs mt-1">Le traitement se fait dans votre navigateur</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div 
                key={i}
                className={`flex items-start gap-2 ${
                  log.type === "error" ? "text-red-400" :
                  log.type === "success" ? "text-green-400" :
                  log.type === "progress" ? "text-white/50" :
                  "text-white/70"
                }`}
              >
                {log.type === "success" && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                {log.type === "error" && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{log.message}</span>
              </div>
            ))
          )}
          {processing && (
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{paused ? "En pause..." : "Traitement en cours..."}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/50">
          <p className="text-xs text-white/40">
            @imgly/background-removal
          </p>
          <div className="flex gap-2">
            {processing ? (
              <>
                <Button
                  variant="outline"
                  onClick={togglePause}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {paused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {paused ? "Reprendre" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  onClick={stopProcessing}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Arrêter
                </Button>
              </>
            ) : (
              <>
                {logs.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setLogs([])}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
                <Button
                  onClick={startProcessing}
                  className="bg-primary text-black hover:bg-yellow-400"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;
