"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  CloudDownload, Loader2, X, CheckCircle, 
  AlertCircle, Image as ImageIcon, ExternalLink, Database
} from "lucide-react";

interface ImageStatus {
  total: number;
  external: number;
  local: number;
  noImage: number;
}

interface LogEntry {
  type: "info" | "success" | "error" | "progress" | "complete";
  message: string;
  current?: number;
  total?: number;
  product?: string;
}

const ImageLocalizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ImageStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products/localize-images");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const startLocalization = async () => {
    setProcessing(true);
    setLogs([]);
    setProgress({ current: 0, total: 0 });

    try {
      const response = await fetch("/api/products/localize-images", {
        method: "POST",
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setLogs(prev => [...prev.slice(-100), data]);
            
            if (data.current && data.total) {
              setProgress({ current: data.current, total: data.total });
            }
          } catch {
            // Not JSON
          }
        }
      }

      await fetchStatus();
    } catch (error) {
      setLogs(prev => [...prev, { type: "error", message: `Erreur: ${error}` }]);
    } finally {
      setProcessing(false);
    }
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-primary text-black dark:text-white hover:bg-primary hover:text-black"
      >
        <CloudDownload className="w-4 h-4 mr-2" />
        Localiser Images
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-black border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <CloudDownload className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold">Localiser les Images</h2>
              <p className="text-xs text-white/60">Télécharger les images externes vers Supabase</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Cards */}
        <div className="p-4 grid grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-4 flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : status ? (
            <>
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center">
                <Database className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{status.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                <ExternalLink className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-600">{status.external}</p>
                <p className="text-xs text-red-600/70">Externes</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <Database className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-600">{status.local}</p>
                <p className="text-xs text-green-600/70">Locales</p>
              </div>
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{status.noImage}</p>
                <p className="text-xs text-muted-foreground">Sans image</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Progress Bar */}
        {processing && progress.total > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">
                {progress.current} / {progress.total}
              </span>
              <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="mx-4 mb-4 h-56 overflow-y-auto bg-black rounded-lg p-3 font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <CloudDownload className="w-10 h-10 mb-2" />
              <p>Télécharge les images externes vers Supabase Storage</p>
              <p className="text-xs mt-1">Les images seront stockées localement et ne seront plus perdues</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div 
                key={i}
                className={`flex items-start gap-2 ${
                  log.type === "error" ? "text-red-400" :
                  log.type === "success" || log.type === "complete" ? "text-green-400" :
                  log.type === "progress" ? "text-white/40" :
                  "text-white/70"
                }`}
              >
                {log.type === "success" || log.type === "complete" ? (
                  <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                ) : log.type === "error" ? (
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                ) : null}
                <span>{log.message || log.product}</span>
              </div>
            ))
          )}
          {processing && (
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Téléchargement en cours...</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/5 dark:bg-white/5">
          <p className="text-xs text-muted-foreground">
            Les images seront stockées dans Supabase Storage
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchStatus}
              disabled={processing}
              className="border-white/20"
            >
              Actualiser
            </Button>
            <Button
              onClick={startLocalization}
              disabled={processing || (status?.external === 0)}
              className="bg-primary text-black hover:bg-yellow-400"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CloudDownload className="w-4 h-4 mr-2" />
              )}
              {processing ? "En cours..." : "Localiser les images"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLocalizer;
