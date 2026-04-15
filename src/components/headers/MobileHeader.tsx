"use client";

import React, { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home, ListOrdered, Menu, ShoppingBag, Store,
  ChevronDown, Laptop, Smartphone, Cpu, Headphones, Monitor,
  Mouse, Keyboard, HardDrive, Camera, Gamepad2, Zap,
  Refrigerator, WashingMachine, Wind, Tv2, Microwave, UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Logo from "../logo/Logo";
import { PARENT_CATEGORIES, SUBCATEGORIES, ParentCategory } from "@/types";

const SUB_ICONS: Record<string, React.ElementType> = {
  'PC PORTABLE': Laptop, 'COMPOSANTS': Cpu, 'ECRANS': Monitor,
  'ACCESSOIRES': Keyboard, 'SMARTPHONE ACCESSOIRES': Smartphone,
  'IMAGE & SON': Headphones, 'CONSOLES': Gamepad2,
  'SÉCURITÉ & PROTECTION': Camera, 'CABLES': Zap,
  'SOURIS': Mouse, 'STOCKAGE': HardDrive, 'AUDIO': Headphones,
  'RÉFRIGÉRATEURS': Refrigerator, 'LAVE-LINGE': WashingMachine,
  'CLIMATISEURS': Wind, 'TÉLÉVISEURS': Tv2,
  'FOURS & MICRO-ONDES': Microwave, 'ASPIRATEURS': Zap,
  'PETIT ÉLECTROMÉNAGER': Zap, 'CUISINE': UtensilsCrossed,
};

const MobileHeader = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ParentCategory | null>(null);

  const topLinks = [
    { link: "/", label: "Accueil", icon: <Home size={18} />, isActive: pathname === "/" },
    { link: "/cart", label: "Mon panier", icon: <ShoppingBag size={18} />, isActive: pathname === "/cart" },
    { link: "/my-orders", label: "Mes commandes", icon: <ListOrdered size={18} />, isActive: pathname.includes("/my-orders") },
  ];

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={24} aria-hidden="true" />
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px] sm:w-80 bg-white border-l border-yellow-100 overflow-y-auto p-0">
          <SheetHeader className="border-b border-yellow-100 px-5 py-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Logo />
          </SheetHeader>

          <nav className="p-3 space-y-1">

            {/* Top static links */}
            {topLinks.map(link => (
              <Link key={link.link} href={link.link} onClick={close}
                className={cn("flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-colors text-gray-700 text-sm font-medium",
                  link.isActive && "bg-primary/10 text-yellow-800")}>
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-2" />

            {/* Category accordions */}
            {PARENT_CATEGORIES.map(pc => (
              <div key={pc.id}>
                {/* Parent toggle */}
                <button
                  onClick={() => setExpanded(e => e === pc.id ? null : pc.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-colors text-gray-800 text-sm font-semibold"
                >
                  <span className="text-lg">{pc.emoji}</span>
                  <span className="flex-1 text-left">{pc.label}</span>
                  <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-200", expanded === pc.id && "rotate-180")} />
                </button>

                {/* Sub-categories */}
                {expanded === pc.id && (
                  <div className="ml-4 mt-1 mb-2 space-y-0.5">
                    {/* View all */}
                    <Link
                      href={`/shop?parent_category=${encodeURIComponent(pc.id)}`}
                      onClick={close}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-yellow-50 text-xs text-yellow-700 font-bold"
                    >
                      <Store size={14} />
                      Voir tout {pc.label}
                    </Link>
                    {SUBCATEGORIES[pc.id].map(sub => {
                      const Icon = SUB_ICONS[sub] ?? Keyboard;
                      return (
                        <Link
                          key={sub}
                          href={`/shop?category=${encodeURIComponent(sub)}`}
                          onClick={close}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-yellow-50 text-gray-600 text-xs transition-colors"
                        >
                          <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Icon size={12} className="text-yellow-700" />
                          </div>
                          {sub}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Tout voir */}
            <div className="h-px bg-gray-100 my-2" />
            <Link href="/shop" onClick={close}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-colors text-gray-700 text-sm font-medium">
              <Store size={18} />
              Tout voir
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileHeader;
