"use client";

import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
}

const ProductImport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv')) {
      setFile(droppedFile);
      resetState();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      resetState();
    }
  };

  const resetState = () => {
    setLogs([]);
    setProgress(null);
    setSuccessCount(0);
    setFailedCount(0);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    resetState();
    addLog('info', `Starting import of ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('updateExisting', String(updateExisting));
      formData.append('stream', 'true');

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          addLog('error', data.error || 'Import failed');
        } catch {
          addLog('error', `Server error: ${text.substring(0, 100)}`);
        }
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        addLog('error', 'Failed to read response stream');
        return;
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const event = JSON.parse(line);
            
            if (event.type === 'progress') {
              setProgress({
                current: event.current,
                total: event.total,
                percentage: Math.round((event.current / event.total) * 100)
              });
            } else if (event.type === 'success') {
              setSuccessCount(prev => prev + 1);
              addLog('success', `✓ ${event.product}`);
            } else if (event.type === 'error') {
              setFailedCount(prev => prev + 1);
              addLog('error', `✗ Row ${event.row}: ${event.message}`);
            } else if (event.type === 'complete') {
              addLog('info', `Import complete: ${event.success} succeeded, ${event.failed} failed`);
            } else if (event.type === 'info') {
              addLog('info', event.message);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (error: any) {
      addLog('error', error.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (importing) return;
    setIsOpen(false);
    setFile(null);
    resetState();
    setUpdateExisting(false);
  };

  const downloadTemplate = () => {
    const template = `name,price,category,description,images,stock,brand
"Product Name",99.99,"Category Name","Product description here","https://example.com/image.jpg",10,"Brand Name"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-black hover:bg-black/80 text-white"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import CSV
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-border rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Import Products</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Import products from a CSV file (WooCommerce compatible)
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Drop Zone */}
          {!importing && logs.length === 0 && (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  ${file ? 'border-primary bg-primary/5' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-12 h-12 text-primary" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <p className="font-medium">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="updateExisting"
                  checked={updateExisting}
                  onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                />
                <label htmlFor="updateExisting" className="text-sm cursor-pointer">
                  Update existing products if name matches
                </label>
              </div>

              {/* Template Download */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                Download CSV template
              </button>

              {/* Supported Columns */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Supported CSV columns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <span>name / title</span>
                  <span>price / regular price</span>
                  <span>category / categories</span>
                  <span>description</span>
                  <span>images / image url</span>
                  <span>stock / stock quantity</span>
                  <span>brand</span>
                  <span>sku</span>
                  <span>tags</span>
                </div>
              </div>
            </>
          )}

          {/* Progress & Logs Section */}
          {(importing || logs.length > 0) && (
            <div className="space-y-4">
              {/* Progress Bar */}
              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing {progress.current} of {progress.total} products</span>
                    <span className="font-medium">{progress.percentage}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="font-medium">{successCount} imported</span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-black/10 rounded-lg">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">{failedCount} failed</span>
                  </div>
                )}
              </div>

              {/* Real-time Logs */}
              <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`py-1 ${
                      log.type === 'success' ? 'text-green-400' : 
                      log.type === 'error' ? 'text-red-400' : 
                      'text-gray-400'
                    }`}
                  >
                    <span className="text-gray-500 mr-2">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {logs.length > 0 && !importing ? 'Close' : 'Cancel'}
          </Button>
          {!importing && logs.length === 0 && (
            <Button
              onClick={handleImport}
              disabled={!file}
              className="bg-primary text-black hover:bg-primary/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Products
            </Button>
          )}
          {!importing && logs.length > 0 && (
            <Button
              onClick={() => { resetState(); }}
              className="bg-primary text-black hover:bg-primary/90"
            >
              Import Another File
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImport;
