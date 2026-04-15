'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GalleryItem {
  id: number;
  image_url: string;
  product_slug?: string;
  product_id?: number;
  alt?: string;
}

// Split items into N columns round-robin
function splitColumns<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

function InfiniteColumn({
  items,
  speed = 30,
  reverse = false,
}: {
  items: GalleryItem[];
  speed?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  useEffect(() => {
    const el = ref.current;
    if (!el || items.length === 0) return;

    let raf = 0;
    let pos = reverse ? -(el.scrollHeight / 2) : 0;
    const halfH = el.scrollHeight / 2;

    const tick = () => {
      pos += reverse ? -speed / 60 : speed / 60;
      if (!reverse && pos >= halfH) pos -= halfH;
      if (reverse && pos <= -halfH) pos += halfH;
      el.style.transform = `translateY(${-pos}px)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items, speed, reverse]);

  return (
    <div className="overflow-hidden flex-1">
      <div ref={ref} className="flex flex-col gap-3 will-change-transform">
        {doubled.map((item, idx) => {
          const img = (
            <div
              key={`${item.id}-${idx}`}
              className="relative w-full overflow-hidden rounded-xl group"
              style={{ aspectRatio: '4/5' }}
            >
              <Image
                src={item.image_url}
                alt={item.alt || 'galerie'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:768px) 50vw, 25vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </div>
          );

          return item.product_slug ? (
            <Link key={`${item.id}-${idx}`} href={`/shop/${item.product_slug}`} className="block">
              {img}
            </Link>
          ) : (
            <div key={`${item.id}-${idx}`}>{img}</div>
          );
        })}
      </div>
    </div>
  );
}

export default function GalerieSection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (items.length < 3) return null; // don't show if not enough images

  // Use 4 columns on desktop, 2 on mobile — split items round-robin
  const cols4 = splitColumns(items, 4);
  const cols2 = splitColumns(items, 2);

  return (
    <section className="py-16 bg-gradient-to-b from-white via-yellow-50/20 to-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-2 bg-primary/15 text-yellow-700 text-sm font-semibold rounded-full mb-4">
            Notre Galerie
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Nos <span className="text-primary">Produits</span> en images
          </h2>
          <p className="text-gray-400 text-sm">Cliquez sur une image pour voir le produit</p>
        </div>

        {/* Desktop: 4 cols */}
        <div className="hidden md:flex gap-3 h-[640px]">
          {cols4.map((col, i) => (
            <InfiniteColumn key={i} items={col} speed={22 + i * 4} reverse={i % 2 === 1} />
          ))}
        </div>

        {/* Mobile: 2 cols */}
        <div className="flex md:hidden gap-3 h-[480px]">
          {cols2.map((col, i) => (
            <InfiniteColumn key={i} items={col} speed={22 + i * 6} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
