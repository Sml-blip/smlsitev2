/**
 * File-based gallery store — used as fallback when Supabase `gallery` table
 * doesn't exist yet. Data persists in /home/user/app/data/gallery.json.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR  = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gallery.json');

interface GalleryItem {
  id: number;
  image_url: string;
  product_slug: string | null;
  product_id: number | null;
  alt: string;
  position: number;
  created_at: string;
}

function read(): GalleryItem[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return []; }
}

function write(items: GalleryItem[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

export function fileGetAll(): GalleryItem[] {
  return read().sort((a, b) => a.position - b.position);
}

export function fileInsert(item: Omit<GalleryItem, 'id' | 'created_at'>): GalleryItem {
  const items = read();
  const maxId = items.reduce((m, i) => Math.max(m, i.id), 0);
  const newItem: GalleryItem = { ...item, id: maxId + 1, created_at: new Date().toISOString() };
  write([...items, newItem]);
  return newItem;
}

export function fileDelete(id: number): void {
  write(read().filter(i => i.id !== id));
}

export function fileUpdate(id: number, patch: Partial<GalleryItem>): GalleryItem | null {
  const items = read();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  write(items);
  return items[idx];
}
