"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import Logo from "../logo/Logo";
import Link from "next/link";
import SearchBox from "./SearchBox";
import Cart from "../carts/Cart";
import {
  Search, Laptop, Smartphone, Cpu, Headphones, Monitor,
  Mouse, Keyboard, HardDrive, Camera, Gamepad2, Printer, Tablet,
  ChevronDown, Refrigerator, WashingMachine, Wind, Tv2,
  Microwave, Zap, UtensilsCrossed,
} from "lucide-react";
import MobileHeader from "./MobileHeader";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMobileSearchModal } from "@/store/mobileSearchStore";
import { PARENT_CATEGORIES, SUBCATEGORIES, ParentCategory } from "@/types";

/* ── Marquee icons ─────────────────────────────────────────────────────────── */
const MARQUEE_ICONS = [
  Laptop, Smartphone, Cpu, Headphones, Monitor,
  Mouse, Keyboard, HardDrive, Camera, Gamepad2, Printer, Tablet,
  Laptop, Smartphone, Cpu, Headphones, Monitor,
  Mouse, Keyboard, HardDrive, Camera, Gamepad2, Printer, Tablet,
];

const FloatingIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="flex items-center gap-10 h-full" style={{ width: "max-content", animation: "marquee-icons 28s linear infinite" }}>
      {MARQUEE_ICONS.map((Icon, i) => (
        <Icon key={i} size={i % 3 === 0 ? 20 : i % 3 === 1 ? 16 : 18} strokeWidth={1.2}
          className="text-yellow-400/20 flex-shrink-0" style={{ marginTop: i % 2 === 0 ? "-6px" : "6px" }} />
      ))}
    </div>
    <style>{`@keyframes marquee-icons{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
  </div>
);

/* ── Sub-category icon map ─────────────────────────────────────────────────── */
const SUB_ICONS: Record<string, React.ElementType> = {
  // Informatique
  'PC PORTABLE': Laptop, 'COMPOSANTS': Cpu, 'ECRANS': Monitor,
  'ACCESSOIRES': Keyboard, 'SMARTPHONE ACCESSOIRES': Smartphone,
  'IMAGE & SON': Headphones, 'CONSOLES': Gamepad2,
  'SÉCURITÉ & PROTECTION': Camera, 'CABLES': Zap,
  'SOURIS': Mouse, 'STOCKAGE': HardDrive, 'AUDIO': Headphones,
  // Électroménager
  'RÉFRIGÉRATEURS': Refrigerator, 'LAVE-LINGE': WashingMachine,
  'CLIMATISEURS': Wind, 'TÉLÉVISEURS': Tv2,
  'FOURS & MICRO-ONDES': Microwave, 'ASPIRATEURS': Zap,
  'PETIT ÉLECTROMÉNAGER': Zap, 'CUISINE': UtensilsCrossed,
};

/* ── Mega menu dropdown ────────────────────────────────────────────────────── */
function MegaMenu({ parent, onClose }: { parent: ParentCategory; onClose: () => void }) {
  const subs = SUBCATEGORIES[parent];
  const half = Math.ceil(subs.length / 2);
  const col1 = subs.slice(0, half);
  const col2 = subs.slice(half);

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[520px] bg-white rounded-b-2xl shadow-2xl border border-yellow-100 overflow-hidden z-50">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 px-6 py-3 flex items-center gap-2">
        <span className="text-2xl">{parent === 'Informatique' ? '💻' : '🏠'}</span>
        <span className="font-bold text-black text-lg">{parent}</span>
        <Link href={`/shop?parent_category=${encodeURIComponent(parent)}`} onClick={onClose}
          className="ml-auto text-black/60 text-xs hover:text-black font-medium underline underline-offset-2">
          Voir tout →
        </Link>
      </div>
      {/* Sub-categories grid */}
      <div className="grid grid-cols-2 gap-0 p-4">
        {[col1, col2].map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map(sub => {
              const Icon = SUB_ICONS[sub] ?? Keyboard;
              return (
                <Link
                  key={sub}
                  href={`/shop?category=${encodeURIComponent(sub)}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-yellow-50 group transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-200 transition-colors">
                    <Icon size={15} className="text-yellow-700" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-yellow-800 font-medium leading-tight">{sub}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main header ───────────────────────────────────────────────────────────── */
const HeaderOne = () => {
  const pathname = usePathname();
  const { openModal } = useMobileSearchModal();
  const [openMenu, setOpenMenu] = useState<ParentCategory | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpenMenu(null); }, [pathname]);

  return (
    <header className="bg-black text-white sticky top-0 z-50 overflow-visible">
      <FloatingIcons />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Logo variant="light" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" ref={menuRef}>

            {/* Accueil */}
            <Link href="/"
              className={cn("px-3 py-2 rounded-lg text-white/80 hover:text-primary transition-colors font-medium text-sm",
                pathname === "/" && "text-primary")}>
              Accueil
            </Link>

            {/* Parent category dropdowns */}
            {PARENT_CATEGORIES.map(pc => (
              <div key={pc.id} className="relative">
                <button
                  onMouseEnter={() => setOpenMenu(pc.id)}
                  onClick={() => setOpenMenu(o => o === pc.id ? null : pc.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/80 hover:text-primary transition-colors font-medium text-sm",
                    pathname.includes(`parent_category=${pc.id}`) && "text-primary"
                  )}
                >
                  <span>{pc.emoji}</span>
                  {pc.label}
                  <ChevronDown size={14} className={cn("transition-transform duration-200", openMenu === pc.id && "rotate-180")} />
                </button>

                {openMenu === pc.id && (
                  <div onMouseLeave={() => setOpenMenu(null)}>
                    <MegaMenu parent={pc.id} onClose={() => setOpenMenu(null)} />
                  </div>
                )}
              </div>
            ))}

            {/* Boutique */}
            <Link href="/shop"
              className={cn("px-3 py-2 rounded-lg text-white/80 hover:text-primary transition-colors font-medium text-sm",
                pathname.startsWith("/shop") && !pathname.includes("parent_category") && "text-primary")}>
              Tout voir
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors" onClick={openModal}>
              <Search size={20} />
            </button>
            <div className="hidden md:block">
              <Suspense fallback={<div className="w-40 h-10 bg-white/10 rounded-lg animate-pulse" />}>
                <SearchBox />
              </Suspense>
            </div>
            <Cart />
            <MobileHeader />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderOne;
