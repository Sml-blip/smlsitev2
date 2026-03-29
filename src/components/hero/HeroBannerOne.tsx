"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Hardcoded hero products ───────────────────────────────────────────────────
const HERO_PRODUCTS = [
  {
    id: 6654,
    name: "ASUS TUF Gaming A15",
    subtitle: "Ryzen 5 7535HS · RTX 2050 4G · 8Go · 512 SSD",
    price: 2089,
    slug: "pc-portable-asus-tuf-gaming-a15-ryzen-5-7535hs-rtx-2050-4g-8-go-512-ssd",
    category: "PC Portable",
    image: "https://xezqtbsmyypotovkbole.supabase.co/storage/v1/object/public/product-images/product-6654-nobg-1773061127171.png",
    badge: "Nouveauté",
    cta: "Commander",
    accent: "#3B82F6",
    accentRgb: "59,130,246",
  },
  {
    id: 6641,
    name: "Xiaomi G27Qi",
    subtitle: "2K · 165Hz · 1ms · IPS · 27 pouces",
    price: 639,
    slug: "xiaomi-2k-gaming-monitor-g27qi-eu",
    category: "Moniteur",
    image: "https://xezqtbsmyypotovkbole.supabase.co/storage/v1/object/public/product-images/products/6641-1773061762487.png",
    badge: "Meilleure vente",
    cta: "Voir le produit",
    accent: "#FB923C",
    accentRgb: "251,146,60",
  },
  {
    id: 6184,
    name: "Gamdias GKB2010",
    subtitle: "Clavier mécanique · RGB · Anti-ghosting",
    price: 149,
    slug: "clavier-gaming-gamdias-gkb2010",
    category: "Clavier Gaming",
    image: "https://xezqtbsmyypotovkbole.supabase.co/storage/v1/object/public/product-images/products/6184-1773062579345.png",
    badge: "Offre spéciale",
    cta: "Acheter",
    accent: "#EF4444",
    accentRgb: "239,68,68",
  },
  {
    id: 6233,
    name: "Razer Kraken X Lite",
    subtitle: "Son surround 7.1 · Ultra léger · PC / PS4",
    price: 169,
    slug: "casque-razer-kraken-x-lite",
    category: "Casque Gaming",
    image: "https://xezqtbsmyypotovkbole.supabase.co/storage/v1/object/public/product-images/products/6233-1773062715877.png",
    badge: "Top Gaming",
    cta: "Acheter",
    accent: "#22C55E",
    accentRgb: "34,197,94",
  },
];

// ── Scanline overlay ──────────────────────────────────────────────────────────
const Scanlines = () => (
  <div
    className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
    style={{
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
    }}
  />
);

// ── Grid background ───────────────────────────────────────────────────────────
const CyberpunkGrid = ({ accentRgb }: { accentRgb: string }) => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.07]"
    style={{
      backgroundImage: `
        linear-gradient(rgba(${accentRgb},0.6) 1px, transparent 1px),
        linear-gradient(90deg, rgba(${accentRgb},0.6) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
      maskImage:
        "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      transition: "background-image 0.7s",
    }}
  />
);

// ── Orbit rings ───────────────────────────────────────────────────────────────
const OrbitRings = ({ accent, accentRgb }: { accent: string; accentRgb: string }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div
      className="absolute rounded-full border"
      style={{
        width: "min(520px, 90vw)",
        height: "min(520px, 90vw)",
        animation: "orbit-spin 18s linear infinite",
        borderStyle: "dashed",
        borderColor: `rgba(${accentRgb},0.2)`,
      }}
    />
    <div
      className="absolute rounded-full border"
      style={{
        width: "min(400px, 70vw)",
        height: "min(400px, 70vw)",
        animation: "orbit-spin-reverse 12s linear infinite",
        borderColor: `rgba(${accentRgb},0.3)`,
      }}
    />
    <div
      className="absolute rounded-full border-2"
      style={{
        width: "min(290px, 52vw)",
        height: "min(290px, 52vw)",
        animation: "orbit-spin 8s linear infinite",
        borderColor: `rgba(${accentRgb},0.5)`,
        boxShadow: `0 0 20px 2px rgba(${accentRgb},0.15), inset 0 0 20px 2px rgba(${accentRgb},0.08)`,
      }}
    />
    <div
      className="absolute"
      style={{
        width: "min(400px, 70vw)",
        height: "min(400px, 70vw)",
        animation: "orbit-spin-reverse 12s linear infinite",
      }}
    >
      <div
        className="absolute w-3 h-3 rounded-full"
        style={{
          top: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          background: accent,
          boxShadow: `0 0 10px 4px rgba(${accentRgb},0.8)`,
        }}
      />
    </div>
    <div
      className="absolute"
      style={{
        width: "min(520px, 90vw)",
        height: "min(520px, 90vw)",
        animation: "orbit-spin 18s linear infinite",
      }}
    >
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          background: `rgba(${accentRgb},0.6)`,
          boxShadow: `0 0 8px 3px rgba(${accentRgb},0.5)`,
        }}
      />
    </div>
  </div>
);

// ── Corner brackets ───────────────────────────────────────────────────────────
const CornerBrackets = ({ accentRgb }: { accentRgb: string }) => (
  <>
    <div className="pointer-events-none absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: `rgba(${accentRgb},0.6)` }} />
    <div className="pointer-events-none absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: `rgba(${accentRgb},0.6)` }} />
    <div className="pointer-events-none absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: `rgba(${accentRgb},0.6)` }} />
    <div className="pointer-events-none absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: `rgba(${accentRgb},0.6)` }} />
  </>
);

// ── Floating particles ────────────────────────────────────────────────────────
const PARTICLES = [
  { left: "8%",  top: "20%", delay: "0s",   dur: "6s",  size: 2 },
  { left: "18%", top: "75%", delay: "1.2s", dur: "7s",  size: 3 },
  { left: "28%", top: "40%", delay: "2.4s", dur: "5s",  size: 2 },
  { left: "72%", top: "15%", delay: "0.6s", dur: "6.5s",size: 3 },
  { left: "82%", top: "60%", delay: "1.8s", dur: "5.5s",size: 2 },
  { left: "92%", top: "35%", delay: "3s",   dur: "7s",  size: 2 },
  { left: "50%", top: "8%",  delay: "0.3s", dur: "8s",  size: 2 },
  { left: "60%", top: "85%", delay: "2s",   dur: "6s",  size: 3 },
];

const Particles = ({ accent, accentRgb }: { accent: string; accentRgb: string }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {PARTICLES.map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full animate-float"
        style={{
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          animationDelay: p.delay,
          animationDuration: p.dur,
          background: accent,
          boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(${accentRgb},0.6)`,
        }}
      />
    ))}
  </div>
);

// ── Badge chip ────────────────────────────────────────────────────────────────
const CyberpunkBadge = ({ text, accent, accentRgb }: { text: string; accent: string; accentRgb: string }) => (
  <div
    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono tracking-widest uppercase"
    style={{
      borderColor: `rgba(${accentRgb},0.4)`,
      background: `rgba(${accentRgb},0.1)`,
      color: accent,
    }}
  >
    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
    {text}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const HeroBannerOne = () => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % HERO_PRODUCTS.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    setCurrent(i);
    startTimer();
  };

  const product = HERO_PRODUCTS[current];
  const { accent, accentRgb } = product;

  return (
    <section className="relative bg-black overflow-hidden flex items-center" style={{ minHeight: "100svh" }}>
      <CyberpunkGrid accentRgb={accentRgb} />
      <Scanlines />
      <CornerBrackets accentRgb={accentRgb} />
      <Particles accent={accent} accentRgb={accentRgb} />

      {/* Deep glow behind product */}
      <div
        className="pointer-events-none absolute right-[5%] md:right-[10%] top-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          width: "min(500px, 80vw)",
          height: "min(500px, 80vw)",
          background: `radial-gradient(circle, rgba(${accentRgb},0.5) 0%, transparent 70%)`,
          transition: "background 0.7s",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-20 max-w-screen-xl mx-auto w-full px-4 md:px-8 py-10 md:py-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4">

          {/* ── Top (mobile) / Right (desktop): Product image ── */}
          <div className="relative w-full md:w-1/2 flex items-center justify-center" style={{ height: "clamp(220px, 42vw, 420px)" }}>
            <OrbitRings accent={accent} accentRgb={accentRgb} />

            <AnimatePresence mode="wait">
              <motion.div
                key={current + "-img"}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative z-10"
                style={{ filter: `drop-shadow(0 0 40px rgba(${accentRgb},0.45))` }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={380}
                  height={380}
                  className="object-contain"
                  style={{ width: "clamp(160px, 36vw, 380px)", height: "clamp(160px, 36vw, 380px)" }}
                  unoptimized
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Floating tag top-right */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 right-2 md:top-6 md:right-0 z-20 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg"
              style={{ border: `1px solid rgba(${accentRgb},0.4)` }}
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold" style={{ color: accent }}>
                {product.category}
              </span>
            </motion.div>

            {/* Floating tag bottom-left */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-2 left-2 md:bottom-6 md:left-0 z-20 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg"
              style={{ border: `1px solid rgba(${accentRgb},0.4)` }}
            >
              <span className="text-white/70 text-[10px] sm:text-xs font-mono">
                <span style={{ color: accent }}>✓</span> Livraison TN
              </span>
            </motion.div>
          </div>

          {/* ── Bottom (mobile) / Left (desktop): Text ── */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-3 md:space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={current + "-text"}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="space-y-3 md:space-y-5"
              >
                <CyberpunkBadge text={product.badge} accent={accent} accentRgb={accentRgb} />

                <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black leading-tight text-white">
                  {product.name.split(" ").slice(0, 2).join(" ")}{" "}
                  <span style={{ color: accent }}>{product.name.split(" ").slice(2).join(" ")}</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-white/40 font-mono max-w-sm mx-auto md:mx-0">
                  {product.subtitle}
                </p>

                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono" style={{ color: accent }}>
                    {product.price.toLocaleString("fr-TN")} TND
                  </span>
                  <span className="text-xs text-white/30 font-mono">TTC</span>
                </div>

                <div className="flex flex-row gap-2 justify-center md:justify-start">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="group inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-black transition-all duration-200 flex-1 sm:flex-none"
                    style={{
                      background: accent,
                      boxShadow: `0 0 20px rgba(${accentRgb},0.4)`,
                    }}
                  >
                    <ShoppingCart size={15} />
                    {product.cta}
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm font-mono hover:bg-white/5 transition-all duration-200 flex-1 sm:flex-none"
                    style={{
                      border: `1px solid rgba(${accentRgb},0.4)`,
                      color: accent,
                    }}
                  >
                    <Zap size={14} />
                    Explorer
                  </Link>
                </div>

                <p className="text-[10px] text-white/25 font-mono uppercase tracking-widest hidden sm:block">
                  // {product.category}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Dot navigation ── */}
        <div className="flex justify-center gap-2 mt-6 md:mt-10 relative z-20">
          {HERO_PRODUCTS.map((p, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "transition-all duration-300 rounded-full",
                i !== current && "w-2 h-2 bg-white/20 hover:bg-white/40"
              )}
              style={
                i === current
                  ? { width: 28, height: 8, background: p.accent, boxShadow: `0 0 8px rgba(${p.accentRgb},0.8)` }
                  : {}
              }
              aria-label={`Produit ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Bottom HUD bar (desktop only) ── */}
        <div className="hidden md:flex items-center justify-between mt-6 pt-4 border-t border-white/5 relative z-20">
          <span className="text-white/20 text-xs font-mono">SML_INFORMATIQUE_v2.0 // TUNIS</span>
          <div className="flex items-center gap-6">
            {["PC Portable", "Smartphone", "Accessoires"].map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="text-white/30 hover:text-white text-xs font-mono transition-colors uppercase tracking-wider"
              >
                {cat}
              </Link>
            ))}
          </div>
          <span className="text-white/20 text-xs font-mono">
            {String(current + 1).padStart(2, "0")} / {String(HERO_PRODUCTS.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerOne;
