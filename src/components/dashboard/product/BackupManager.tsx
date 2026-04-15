"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, Upload, HardDrive, Database, 
  Image as ImageIcon, Loader2, X, CheckCircle, 
  AlertCircle, RefreshCw
} from "lucide-react";

interface BackupStatus {
  backup: {
    exists: boolean;
    date: string | null;
    productCount: number;
  };
  images: {
    count: number;
  };
  database: {
    productCount: number;
  };
}

interface LogEntry {
  type: "info" | "success" | "error" | "progress" | "complete";
  message: string;
}

const BackupManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [action, setAction] = useState<"backup" | "restore" | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products/backup");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const startBackup = async () => {
    setProcessing(true);
    setAction("backup");
    setLogs([]);

    try {
      const response = await fetch("/api/products/backup", {
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
            addLog(data);
          } catch {
            // Not JSON
          }
        }
      }

      await fetchStatus();
    } catch (error) {
      addLog({ type: "error", message: `Erreur: ${error}` });
    } finally {
      setProcessing(false);
    }
  };

  const startRestore = async () => {
    if (!confirm("Restaurer depuis la sauvegarde? Cela remplacera tous les produits actuels.")) {
      return;
    }

    setProcessing(true);
    setAction("restore");
    setLogs([]);

    try {
      const response = await fetch("/api/products/backup", {
        method: "PUT",
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
            addLog(data);
          } catch {
            // Not JSON
          }
        }
      }

      await fetchStatus();
    } catch (error) {
      addLog({ type: "error", message: `Erreur: ${error}` });
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-primary text-black hover:bg-primary hover:text-black"
      >
        <HardDrive className="w-4 h-4 mr-2" />
        Backup
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold">Sauvegarde & Restauration</h2>
              <p className="text-xs text-white/60">Protégez vos données produits</p>
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
        <div className="p-4 grid grid-cols-3 gap-3">
          {loading ? (
            <div className="col-span-3 flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : status ? (
            <>
              <div className="bg-black/5 rounded-xl p-4">
                <Database className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{status.database.productCount}</p>
                <p className="text-xs text-muted-foreground">Produits en DB</p>
              </div>
              <div className="bg-black/5 rounded-xl p-4">
                <HardDrive className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{status.backup.productCount}</p>
                <p className="text-xs text-muted-foreground">
                  {status.backup.exists ? "Sauvegardés" : "Pas de backup"}
                </p>
              </div>
              <div className="bg-black/5 rounded-xl p-4">
                <ImageIcon className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{status.images.count}</p>
                <p className="text-xs text-muted-foreground">Images locales</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Last Backup Info */}
        {status?.backup.date && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground">
              Dernière sauvegarde: {new Date(status.backup.date).toLocaleString("fr-FR")}
            </p>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mx-4 mb-4 h-48 overflow-y-auto bg-black rounded-lg p-3 font-mono text-sm space-y-1">
            {logs.map((log, i) => (
              <div 
                key={i}
                className={`flex items-start gap-2 ${
                  log.type === "error" ? "text-red-400" :
                  log.type === "success" || log.type === "complete" ? "text-green-400" :
                  log.type === "progress" ? "text-white/50" :
                  "text-white/70"
                }`}
              >
                {log.type === "success" || log.type === "complete" ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                ) : log.type === "error" ? (
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                ) : null}
                <span>{log.message}</span>
              </div>
            ))}
            {processing && (
              <div className="flex items-center gap-2 text-primary animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>En cours...</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/5">
          <Button
            variant="outline"
            onClick={fetchStatus}
            disabled={processing}
            className="border-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={startRestore}
              disabled={processing || !status?.backup.exists}
              className="border-white/20"
            >
              {processing && action === "restore" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Restaurer
            </Button>
            <Button
              onClick={startBackup}
              disabled={processing}
              className="bg-primary text-black hover:bg-yellow-400"
            >
              {processing && action === "backup" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
