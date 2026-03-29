"use client";

import React, { Suspense } from "react";
import Logo from "../logo/Logo";
import Link from "next/link";
import SearchBox from "./SearchBox";
import Cart from "../carts/Cart";
import { Search } from "lucide-react";
import MobileHeader from "./MobileHeader";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMobileSearchModal } from "@/store/mobileSearchStore";

const HeaderOne = () => {
  const pathname = usePathname();

  const links = [
    {
      label: "Accueil",
      link: "/",
      isActive: pathname === "/",
    },
    {
      label: "Boutique",
      link: "/shop",
      isActive: pathname.startsWith("/shop"),
    },
  ];

  const { openModal } = useMobileSearchModal();

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo variant="light" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.link}
                href={link.link}
                className={cn(
                  "text-white/80 hover:text-primary transition-colors font-medium",
                  link.isActive && "text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={openModal}
            >
              <Search size={20} />
            </button>

            {/* Desktop Search */}
            <div className="hidden md:block">
              <Suspense fallback={<div className="w-40 h-10 bg-white/10 rounded-lg animate-pulse" />}>
                <SearchBox />
              </Suspense>
            </div>

            {/* Panier */}
            <Cart />

            {/* Mobile Menu */}
            <MobileHeader />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderOne;
