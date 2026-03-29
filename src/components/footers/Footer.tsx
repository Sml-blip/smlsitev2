"use client";

import React from "react";
import { FaFacebook, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  ArrowRight,
  Laptop,
  Cpu,
  Gamepad2,
  Monitor,
  Volume2,
  ShieldCheck,
  Smartphone,
  Package,
} from "lucide-react";

const footerCategories = [
  { name: "PC PORTABLE",            icon: Laptop },
  { name: "COMPOSANTS",             icon: Cpu },
  { name: "CONSOLES",               icon: Gamepad2 },
  { name: "ECRANS",                 icon: Monitor },
  { name: "IMAGE & SON",            icon: Volume2 },
  { name: "ACCESSOIRES",            icon: Package },
  { name: "SÉCURITÉ & PROTECTION",  icon: ShieldCheck },
  { name: "SMARTPHONE ACCESSOIRES", icon: Smartphone },
];



const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

      {/* Yellow Accent Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-yellow-400 to-primary" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">

          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-light.svg"
                alt="SML Informatique"
                width={160}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-white/70 leading-relaxed text-sm">
              Votre boutique unique pour tout l&apos;électronique et
              l&apos;informatique. Qualité, service et prix imbattables.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 flex-wrap">
              <Link
                href="https://www.facebook.com/p/SML-100095443628667/"
                target="_blank"
                className="w-10 h-10 bg-white/10 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <FaFacebook size={20} className="text-white" />
              </Link>
              <Link
                href="https://www.instagram.com/sml.tech"
                target="_blank"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <FaInstagramSquare size={20} className="text-white" />
              </Link>
              <Link
                href="https://www.tiktok.com/@sml.tech/"
                target="_blank"
                className="w-10 h-10 bg-white/10 hover:bg-black rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-transparent hover:border-white/20"
              >
                <FaTiktok size={18} className="text-white" />
              </Link>
              <Link
                href="http://wa.me/21648028729"
                target="_blank"
                className="w-10 h-10 bg-white/10 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <FaWhatsapp size={20} className="text-white" />
              </Link>
            </div>
          </div>

          {/* Categories — col 1 */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary" />
              Catégories
            </h3>
            <ul className="space-y-2.5">
              {footerCategories.slice(0, 4).map(({ name, icon: Icon }) => (
                <li key={name}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(name)}`}
                    className="text-white/70 hover:text-primary transition-colors duration-300 flex items-center gap-2.5 group"
                  >
                    <Icon size={15} className="text-primary/70 group-hover:text-primary shrink-0 transition-colors duration-300" />
                    <span className="text-sm">{name.charAt(0) + name.slice(1).toLowerCase()}</span>
                    <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories — col 2 */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 invisible">
              <span className="w-8 h-0.5 bg-primary" />
              &nbsp;
            </h3>
            <ul className="space-y-2.5">
              {footerCategories.slice(4).map(({ name, icon: Icon }) => (
                <li key={name}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(name)}`}
                    className="text-white/70 hover:text-primary transition-colors duration-300 flex items-center gap-2.5 group"
                  >
                    <Icon size={15} className="text-primary/70 group-hover:text-primary shrink-0 transition-colors duration-300" />
                    <span className="text-sm">{name.charAt(0) + name.slice(1).toLowerCase()}</span>
                    <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Ain Mnekh, El Kef</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+216 78 203 905</span>
              </li>
            </ul>

            {/* WhatsApp Neon CTA Button */}
            <Link
              href="http://wa.me/21648028729"
              target="_blank"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-white relative overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #128C7E, #25D366)",
                boxShadow:
                  "0 0 12px rgba(37,211,102,0.5), 0 0 30px rgba(37,211,102,0.25), inset 0 0 12px rgba(255,255,255,0.05)",
              }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: "#25D366" }}
              />
              <FaWhatsapp
                size={22}
                className="relative z-10 drop-shadow-[0_0_6px_rgba(37,211,102,0.9)]"
              />
              <span className="relative z-10">Nous contacter</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              &copy; 2025 <span className="text-primary">SML INFORMATIQUE</span>
              . Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="text-white/50 hover:text-primary transition-colors">
                Conditions
              </Link>
              <Link href="#" className="text-white/50 hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link href="#" className="text-white/50 hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
