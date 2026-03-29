"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Monitor, 
  Smartphone, 
  Headphones, 
  Gamepad2, 
  Shield, 
  Cpu, 
  Tv,
  Package,
  LucideIcon
} from "lucide-react";

interface CategoryData {
  name: string;
  count: number;
  icon: LucideIcon;
}

// Map category names to icons
const categoryIcons: Record<string, LucideIcon> = {
  "ACCESSOIRES": Package,
  "SMARTPHONE ACCESSOIRES": Smartphone,
  "IMAGE & SON": Headphones,
  "PC PORTABLE": Monitor,
  "CONSOLES": Gamepad2,
  "SÉCURITÉ & PROTECTION": Shield,
  "COMPOSANTS": Cpu,
  "ECRANS": Tv,
};

const CategoriesCollection = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      // Count products per category
      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        if (item.category) {
          counts[item.category] = (counts[item.category] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const categoriesArray = Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          icon: categoryIcons[name] || Package,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nos <span className="text-primary">Catégories</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Explorez notre large sélection de produits informatiques et électroniques
          </p>
        </div>

        {/* 3D Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group cursor-pointer perspective-1000"
                style={{ perspective: "1000px" }}
              >
                <div
                  className={`
                    relative h-48 md:h-56 rounded-2xl p-6
                    bg-gradient-to-br from-white/10 to-white/5
                    border border-white/10
                    backdrop-blur-sm
                    transform-gpu transition-all duration-500 ease-out
                    ${isHovered ? "scale-105 -translate-y-2" : ""}
                    hover:border-primary/50
                    hover:shadow-[0_0_40px_rgba(255,204,0,0.2)]
                  `}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isHovered
                      ? "rotateX(-5deg) rotateY(5deg) scale(1.05) translateY(-8px)"
                      : "rotateX(0) rotateY(0)",
                  }}
                >
                  {/* Glow Effect */}
                  <div
                    className={`
                      absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                      bg-gradient-to-br from-primary/20 via-transparent to-transparent
                      transition-opacity duration-500
                    `}
                  />

                  {/* Icon Container */}
                  <div
                    className={`
                      relative w-14 h-14 md:w-16 md:h-16 rounded-xl mb-4
                      bg-gradient-to-br from-primary to-yellow-400
                      flex items-center justify-center
                      transform-gpu transition-all duration-500
                      ${isHovered ? "scale-110 rotate-[-5deg]" : ""}
                      shadow-lg shadow-primary/30
                    `}
                    style={{
                      transform: isHovered ? "translateZ(30px) rotate(-5deg)" : "translateZ(0)",
                    }}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-black" />
                  </div>

                  {/* Category Name */}
                  <h3
                    className={`
                      text-white font-bold text-sm md:text-base leading-tight mb-2
                      transform-gpu transition-all duration-500
                    `}
                    style={{
                      transform: isHovered ? "translateZ(20px)" : "translateZ(0)",
                    }}
                  >
                    {category.name}
                  </h3>

                  {/* Product Count */}
                  <p
                    className={`
                      text-white/50 text-sm
                      transform-gpu transition-all duration-500
                    `}
                    style={{
                      transform: isHovered ? "translateZ(15px)" : "translateZ(0)",
                    }}
                  >
                    {category.count} produits
                  </p>

                  {/* Bottom Arrow */}
                  <div
                    className={`
                      absolute bottom-4 right-4 w-8 h-8 rounded-full
                      bg-white/10 flex items-center justify-center
                      transform-gpu transition-all duration-500
                      ${isHovered ? "bg-primary scale-110" : ""}
                    `}
                    style={{
                      transform: isHovered ? "translateZ(25px) scale(1.1)" : "translateZ(0)",
                    }}
                  >
                    <svg
                      className={`w-4 h-4 transition-colors duration-300 ${isHovered ? "text-black" : "text-white/50"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* Floating Particles */}
                  {isHovered && (
                    <>
                      <div className="absolute top-4 right-8 w-2 h-2 bg-primary rounded-full animate-ping" />
                      <div className="absolute bottom-12 left-4 w-1.5 h-1.5 bg-primary/60 rounded-full animate-ping animation-delay-200" />
                      <div className="absolute top-1/2 right-4 w-1 h-1 bg-white/40 rounded-full animate-ping animation-delay-400" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,204,0,0.4)]"
          >
            Voir toutes les catégories
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesCollection;
