"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HelpCircle,
  Home,
  ListOrdered,
  Menu,
  ShoppingBag,
  Store,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Logo from "../logo/Logo";

const MobileHeader = () => {
  const pathname = usePathname();

  const navlinks = [
    {
      link: "/",
      label: "Accueil",
      icon: <Home size={20} />,
      isActive: pathname === "/",
    },
    {
      link: "/shop",
      label: "Boutique",
      icon: <Store size={20} />,
      isActive: pathname.startsWith("/shop"),
    },
    {
      link: "/cart",
      label: "Mon panier",
      icon: <ShoppingBag size={20} />,
      isActive: pathname === "/cart",
    },
    {
      link: "/my-orders",
      label: "Mes commandes",
      icon: <ListOrdered size={20} />,
      isActive: pathname.includes("/my-orders"),
    },
    {
      link: "/help",
      label: "Aide",
      icon: <HelpCircle size={20} />,
      isActive: pathname.includes("/help"),
    },
  ];

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={24} aria-hidden="true" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-white dark:bg-black">
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <Logo />
          </SheetHeader>
          <nav className="space-y-1 text-start">
            {navlinks.map((link) => (
              <Link
                key={link.link}
                href={link.link}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
                  link.isActive && "bg-primary/10 text-primary font-medium"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Separator className="!my-4" />
            <div className="flex items-center gap-3 p-3">
              <ThemeToggle />
              <span>Changer le thème</span>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileHeader;
