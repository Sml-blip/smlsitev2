"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Link2, Loader2, Sparkles, X, Plus } from "lucide-react";
import { PARENT_CATEGORIES, SUBCATEGORIES, ParentCategory } from "@/types";

const BRANDS = [
  'Apple', 'Samsung', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'HP', 'Dell',
  'Lenovo', 'Asus', 'Acer', 'Microsoft', 'Realme', 'Peco', 'TCL',
  'Hisense', 'Beko', 'Whirlpool', 'Bosch', 'Indesit', 'Autre',
];

interface FormState {
  name: string;
  price: string;
  discount: string;
  parent_category: ParentCategory | '';
  category: string;
  brand: string;
  description: string;
  stock: string;
  images: string[];
}

const EMPTY: FormState = {
  name: '', price: '', discount: '', parent_category: '',
  category: '', brand: '', description: '', stock: '10', images: [],
};

export default function ProductForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (text: string, ok = true) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };
  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  // ── Scrape external URL ─────────────────────────────────────────────────────
  const scrape = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });
      const d = await res.json();
      if (d.error) { flash('Impossible de récupérer cette page : ' + d.error, false); return; }
      setForm(p => ({
        ...p,
        name: d.name || p.name,
        description: d.description || p.description,
        price: d.price || p.price,
        images: d.images?.length ? d.images.slice(0, 5) : p.images,
      }));
      flash('✅ Données importées ! Vérifiez et corrigez si besoin.');
    } catch { flash('Erreur de connexion', false); }
    finally { setScraping(false); }
  };

  // ── Upload local image ──────────────────────────────────────────────────────
  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/gallery/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm(p => ({ ...p, images: [...p.images, url] }));
        flash('Image uploadée !');
      } else flash('Erreur upload', false);
    } catch { flash('Erreur upload', false); }
    finally { setUploading(false); }
  };

  const removeImage = (i: number) =>
    setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  const addImageUrl = () => {
    const url = prompt('Entrez l\'URL de l\'image :');
    if (url?.trim()) setForm(p => ({ ...p, images: [...p.images, url.trim()] }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.brand) {
      flash('Remplissez les champs obligatoires (*)', false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: form.price,
          category: form.category,
          parent_category: form.parent_category || null,
          brand: form.brand,
          description: form.description,
          discount: form.discount ? parseInt(form.discount) : 0,
          images: form.images,
          stockItems: form.stock ? parseInt(form.stock) : 10,
          featured: false,
        }),
      });
      if (res.ok) {
        flash('✅ Produit ajouté !');
        setForm(EMPTY);
        setTimeout(() => router.push('/dashboard/products'), 1200);
      } else {
        const d = await res.json();
        flash(d.error || 'Erreur', false);
      }
    } catch { flash('Erreur serveur', false); }
    finally { setSaving(false); }
  };

  const subCategories = form.parent_category ? SUBCATEGORIES[form.parent_category] : [];

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium text-center ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* ── URL Scraper ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-yellow-600" />
          <h3 className="font-bold text-gray-800">Importer depuis un lien</h3>
          <span className="text-xs text-gray-400 ml-auto">Colle le lien d&apos;une fiche produit (Jumia, MyCom, etc.)</span>
        </div>
        <div className="flex gap-2">
          <input
            value={scrapeUrl}
            onChange={e => setScrapeUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && scrape()}
            placeholder="https://www.jumia.com.tn/..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
          />
          <button
            type="button"
            onClick={scrape}
            disabled={scraping || !scrapeUrl.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-xl text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {scraping ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
            {scraping ? 'Import...' : 'Importer'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">⚠️ Vérifiez les données importées avant de sauvegarder. Certains sites bloquent le scraping.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">

        {/* ── Images ────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 mb-3">Images du produit</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <Image src={img} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
                {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-black/50 py-0.5">Principale</span>}
              </div>
            ))}

            {/* Upload btn */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-yellow-400 transition-colors text-gray-400 hover:text-yellow-600"
            >
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              <span className="text-xs">Upload</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />

            {/* URL btn */}
            <button
              type="button"
              onClick={addImageUrl}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-yellow-400 transition-colors text-gray-400 hover:text-yellow-600"
            >
              <Link2 size={20} />
              <span className="text-xs">URL</span>
            </button>
          </div>
          <p className="text-xs text-gray-400">La première image est l&apos;image principale.</p>
        </div>

        {/* ── Core fields ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du produit *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex: Samsung Galaxy A55"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prix (DT) *</label>
            <input
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="299.000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remise (%)</label>
            <input
              value={form.discount}
              onChange={e => set('discount', e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
            <input
              value={form.stock}
              onChange={e => set('stock', e.target.value)}
              placeholder="10"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Parent category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Rayon *</label>
            <select
              value={form.parent_category}
              onChange={e => setForm(p => ({ ...p, parent_category: e.target.value as ParentCategory, category: '' }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">-- Choisir un rayon --</option>
              {PARENT_CATEGORIES.map(pc => (
                <option key={pc.id} value={pc.id}>{pc.emoji} {pc.label}</option>
              ))}
            </select>
          </div>

          {/* Sub-category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie *</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-yellow-400"
              disabled={!form.parent_category}
            >
              <option value="">{form.parent_category ? '-- Choisir une catégorie --' : 'Choisissez d\'abord un rayon'}</option>
              {subCategories.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Marque *</label>
            <select
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">-- Choisir une marque --</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Description du produit..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Plus size={16} /> Ajouter le produit</>}
        </button>
      </form>
    </div>
  );
}
