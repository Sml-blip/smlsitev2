"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Laptop, Smartphone, Headphones, Shield, Gamepad2, Cpu, Monitor,
  ArrowRight, Keyboard, Mouse, HardDrive, Zap,
  Refrigerator, WashingMachine, Wind, Tv2, Microwave, UtensilsCrossed,
  Package, Store, X, Truck, Bell,
} from "lucide-react";
import { SUBCATEGORIES } from "@/types";

/* ── Icon map ──────────────────────────────────────────────────────────────── */
const CAT_ICONS: Record<string, React.ElementType> = {
  "ACCESSOIRES": Keyboard,       "SMARTPHONE ACCESSOIRES": Smartphone,
  "IMAGE & SON": Headphones,     "PC PORTABLE": Laptop,
  "CONSOLES": Gamepad2,          "SÉCURITÉ & PROTECTION": Shield,
  "COMPOSANTS": Cpu,             "ECRANS": Monitor,
  "CABLES": Zap,                 "SOURIS": Mouse,
  "STOCKAGE": HardDrive,         "AUDIO": Headphones,
  "RÉFRIGÉRATEURS": Refrigerator,"LAVE-LINGE": WashingMachine,
  "CLIMATISEURS": Wind,          "TÉLÉVISEURS": Tv2,
  "FOURS & MICRO-ONDES": Microwave,"ASPIRATEURS": Wind,
  "PETIT ÉLECTROMÉNAGER": Zap,   "CUISINE": UtensilsCrossed,
};

function getIcon(name: string): React.ElementType {
  if (CAT_ICONS[name]) return CAT_ICONS[name];
  const upper = name.toUpperCase();
  for (const [k, V] of Object.entries(CAT_ICONS)) {
    if (upper.includes(k) || k.includes(upper)) return V;
  }
  return Package;
}

/* ── Arrivage Popup ────────────────────────────────────────────────────────── */
function ArrivagePopup({ name, onClose }: { name: string; onClose: () => void }) {
  const router = useRouter();

  // Close on backdrop click
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        onClick={onBackdrop}
      >
        <motion.div
          key="card"
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>

          {/* Animated top band */}
          <div className="relative h-32 bg-gradient-to-br from-yellow-800 to-yellow-900 overflow-hidden flex items-center justify-center">
            {/* Pulse rings */}
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-yellow-400/30"
                initial={{ width: 40, height: 40, opacity: 0.8 }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
            {/* Truck icon */}
            <motion.div
              animate={{ x: ["-60px", "0px", "-60px"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Truck size={52} className="text-yellow-300" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-7 py-6 text-center">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 300 }}
              className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            >
              <Bell size={12} className="animate-bounce" />
              En cours de référencement
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-black text-gray-900 mb-1"
            >
              En Arrivage 🚚
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-gray-500 text-sm mb-1 font-medium"
            >
              {name}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="text-gray-400 text-sm mb-6"
            >
              Cette catégorie sera bientôt disponible. Nos produits sont en route !
            </motion.p>

            {/* Dots loader */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-yellow-800"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { router.push("/shop"); onClose(); }}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Store size={16} />
              Voir ce qui est disponible
            </motion.button>

            <button
              onClick={onClose}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors w-full"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Section ──────────────────────────────────────────────────────────── */
interface CategoryData { name: string; count: number; parent: string; }

const CategorySectionOne = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [arrivageCategory, setArrivageCategory] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase.from("products").select("category, parent_category");

      // Count products per category
      const countMap = new Map<string, number>();
      data?.forEach(p => {
        const cat = p.category || "Divers";
        countMap.set(cat, (countMap.get(cat) || 0) + 1);
      });

      // Build list: all subcategories from both parents, with real counts from DB
      const result: CategoryData[] = [];

      // 1. All Informatique subcategories (always shown, count from DB or 0)
      SUBCATEGORIES["Informatique"].forEach(sub => {
        result.push({ name: sub, count: countMap.get(sub) || 0, parent: "Informatique" });
      });

      // 2. All Électroménager subcategories (always shown, count from DB or 0)
      SUBCATEGORIES["Électroménager"].forEach(sub => {
        result.push({ name: sub, count: countMap.get(sub) || 0, parent: "Électroménager" });
      });

      setCategories(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleClick = (cat: CategoryData) => {
    if (cat.count === 0 && cat.parent === "Électroménager") {
      setArrivageCategory(cat.name);
    } else {
      router.push(`/shop?category=${encodeURIComponent(cat.name)}&page=1`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -12 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 100, damping: 14 } },
  };

  // Split into two groups for visual separation
  const infoCategories   = categories.filter(c => c.parent === "Informatique");
  const electroCategories = categories.filter(c => c.parent === "Électroménager");

  const renderGrid = (cats: CategoryData[]) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
      style={{ perspective: "1000px" }}
    >
      {cats.map(cat => {
        const Icon = getIcon(cat.name);
        const isEmpty = cat.count === 0 && cat.parent === "Électroménager";
        return (
          <motion.div
            key={cat.name}
            variants={cardVariants}
            whileHover={{ scale: isEmpty ? 1.03 : 1.05, rotateY: isEmpty ? 0 : 4, rotateX: isEmpty ? 0 : 4, z: 40 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(cat)}
            className="group cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className={`relative bg-white border rounded-2xl p-5 h-full overflow-hidden transition-all duration-400
              ${isEmpty
                ? "border-dashed border-gray-200 opacity-70 hover:opacity-100 hover:border-yellow-700/40"
                : "border-gray-200 hover:border-yellow-700/50 hover:shadow-[0_4px_24px_rgba(31,23,3,0.12)]"
              }`}
            >
              {/* Arrivage badge */}
              {isEmpty && (
                <div className="absolute top-3 right-3 z-20">
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[9px] font-black uppercase tracking-wider bg-yellow-800 text-white px-2 py-0.5 rounded-full"
                  >
                    Arrivage
                  </motion.span>
                </div>
              )}

              {/* Hover glow */}
              {!isEmpty && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/0 group-hover:from-yellow-50 group-hover:via-yellow-50/40 to-transparent transition-all duration-500 rounded-2xl" />
              )}

              {/* Icon */}
              <div className="relative z-10 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110
                  ${isEmpty
                    ? "bg-gray-100 group-hover:bg-yellow-50"
                    : "bg-gradient-to-br from-yellow-800/10 to-yellow-700/5 group-hover:from-yellow-800/20"
                  }`}
                >
                  <Icon className={`w-7 h-7 ${isEmpty ? "text-gray-400 group-hover:text-yellow-800" : "text-yellow-800"}`} />
                </div>
              </div>

              {/* Text */}
              <div className="relative z-10">
                <h3 className={`font-bold text-base mb-1 leading-tight transition-colors
                  ${isEmpty ? "text-gray-500 group-hover:text-gray-800" : "text-gray-900 group-hover:text-yellow-900"}`}
                >
                  {cat.name}
                </h3>
                <p className={`text-xs ${isEmpty ? "text-gray-400" : "text-gray-400"}`}>
                  {isEmpty ? "Bientôt disponible" : cat.count > 0 ? `${cat.count} produit${cat.count > 1 ? "s" : ""}` : "Explorer"}
                </p>
              </div>

              {/* Arrow or truck */}
              <div className="absolute bottom-4 right-4 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                {isEmpty
                  ? <Truck className="w-4 h-4 text-yellow-800" />
                  : <ArrowRight className="w-4 h-4 text-yellow-800" />
                }
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-white via-yellow-50/20 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-800/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-800/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-10 space-y-16">

          {/* Section header + Informatique grid inline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <span className="inline-block px-4 py-2 bg-yellow-800/10 text-yellow-900 text-sm font-semibold rounded-full mb-4">
                Explorer par catégorie
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Nos <span className="text-yellow-900">Catégories</span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Informatique & Électroménager — tout ce qu&apos;il vous faut
              </p>
            </motion.div>

            {/* Informatique categories directly under the heading */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-yellow-800 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : infoCategories.length > 0 && renderGrid(infoCategories)}
          </div>

          {/* Électroménager */}
          {!loading && electroCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏠</span>
                <h3 className="text-xl font-bold text-gray-900">Électroménager</h3>
                <div className="flex-1 h-px bg-gray-200" />
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-bold text-yellow-900 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full"
                >
                  🚚 En arrivage
                </motion.span>
              </div>
              {renderGrid(electroCategories)}
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={() => router.push("/shop")}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-700 transition-all duration-300 hover:scale-105"
            >
              Voir tous les produits
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Arrivage popup */}
      {arrivageCategory && (
        <ArrivagePopup
          name={arrivageCategory}
          onClose={() => setArrivageCategory(null)}
        />
      )}
    </>
  );
};

export default CategorySectionOne;
