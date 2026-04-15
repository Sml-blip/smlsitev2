'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Trash2, ExternalLink, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface GalleryItem {
  id: number;
  image_url: string;
  product_slug?: string;
  alt?: string;
  position: number;
}

interface UploadJob {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
}

export default function GalleryDashboard() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

  const load = () => {
    setLoading(true);
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Upload single file ──────────────────────────────────────────────────────
  const uploadOne = async (job: UploadJob) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'uploading' } : j));
    try {
      const fd = new FormData();
      fd.append('file', job.file);
      const res = await fetch('/api/gallery/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      // Save to gallery table
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, alt: job.file.name.replace(/\.[^.]+$/, '') }),
      });

      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'done', url } : j));
      return true;
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'error', error: e.message } : j));
      return false;
    }
  };

  // ── Queue + run all ─────────────────────────────────────────────────────────
  const enqueueFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;

    const newJobs: UploadJob[] = arr.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));

    setJobs(prev => [...prev, ...newJobs]);

    // Upload sequentially (avoid hammering storage)
    for (const job of newJobs) {
      await uploadOne(job);
    }

    load(); // refresh gallery grid
    flash(`✅ ${arr.length} image${arr.length > 1 ? 's' : ''} ajoutée${arr.length > 1 ? 's' : ''} !`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drag & drop handlers ────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) enqueueFiles(e.dataTransfer.files);
  };

  const removeItem = async (id: number) => {
    if (!confirm('Supprimer cette image ?')) return;
    await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
    flash('Supprimé');
  };

  const clearDone = () => {
    jobs.forEach(j => j.preview && URL.revokeObjectURL(j.preview));
    setJobs([]);
  };

  const pendingCount  = jobs.filter(j => j.status === 'uploading' || j.status === 'pending').length;
  const doneCount     = jobs.filter(j => j.status === 'done').length;
  const errorCount    = jobs.filter(j => j.status === 'error').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">🖼️ Galerie d&apos;images</h1>
          <p className="text-gray-500 text-sm mt-1">
            Images affichées sur la page d&apos;accueil — {items.length} image{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a href="/" target="_blank" className="flex items-center gap-2 text-sm text-yellow-700 hover:underline">
          <ExternalLink size={14} /> Voir sur le site
        </a>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium text-center ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* ── Drop zone ──────────────────────────────────────────────────────── */}
      <div
        ref={dropRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 select-none
          ${dragging
            ? 'border-yellow-400 bg-yellow-50 scale-[1.01]'
            : 'border-gray-300 bg-white hover:border-yellow-400 hover:bg-yellow-50/40'
          }`}
      >
        <Upload size={36} className={`mx-auto mb-3 ${dragging ? 'text-yellow-500' : 'text-gray-400'}`} />
        <p className="font-semibold text-gray-700 text-base">
          {dragging ? 'Relâchez pour uploader' : 'Glissez-déposez vos images ici'}
        </p>
        <p className="text-sm text-gray-400 mt-1">ou cliquez pour choisir — sélection multiple supportée</p>
        <p className="text-xs text-gray-300 mt-2">JPG, PNG, WEBP — taille illimitée</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && enqueueFiles(e.target.files)}
        />
      </div>

      {/* ── Upload queue progress ───────────────────────────────────────────── */}
      {jobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-700">
                  <Loader2 size={14} className="animate-spin" />
                  {pendingCount} en cours
                </span>
              )}
              {doneCount > 0 && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 size={14} />
                  {doneCount} ok
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-500">
                  <XCircle size={14} />
                  {errorCount} erreur{errorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {pendingCount === 0 && (
              <button onClick={clearDone} className="text-xs text-gray-400 hover:text-gray-600">
                Effacer
              </button>
            )}
          </div>

          {/* Progress bar */}
          {jobs.length > 0 && (
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${Math.round((doneCount + errorCount) / jobs.length * 100)}%` }}
              />
            </div>
          )}

          {/* Thumbnails row */}
          <div className="flex flex-wrap gap-2 p-4">
            {jobs.map(job => (
              <div key={job.id} className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={job.preview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {job.status === 'uploading' && (
                    <div className="w-full h-full bg-black/40 flex items-center justify-center">
                      <Loader2 size={18} className="text-white animate-spin" />
                    </div>
                  )}
                  {job.status === 'done' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 flex items-center justify-center py-0.5">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}
                  {job.status === 'error' && (
                    <div className="w-full h-full bg-red-500/60 flex items-center justify-center">
                      <XCircle size={18} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gallery grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🖼️</div>
          <p>Aucune image. Uploadez-en ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-[4/5]">
                <Image src={item.image_url} alt={item.alt || ''} fill className="object-cover" unoptimized />
              </div>
              {item.product_slug && (
                <div className="px-2 py-1 text-xs text-gray-500 truncate bg-white border-t border-gray-100">
                  🔗 {item.product_slug}
                </div>
              )}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
