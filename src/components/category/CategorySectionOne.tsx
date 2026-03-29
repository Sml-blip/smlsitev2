"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Laptop, Smartphone, Headphones, Watch, 
  Shield, Gamepad2, Cpu, Monitor,
  ArrowRight, Cable, Speaker, Keyboard,
  Mouse, HardDrive, Usb
} from "lucide-react";

interface CategoryData {
  name: string;
  count: number;
}

// Category icons mapping - matched to actual database categories
const categoryIcons: Record<string, React.ElementType> = {
  "ACCESSOIRES": Keyboard,
  "SMARTPHONE ACCESSOIRES": Smartphone,
  "IMAGE & SON": Speaker,
  "PC PORTABLE": Laptop,
  "CONSOLES": Gamepad2,
  "SÉCURITÉ & PROTECTION": Shield,
  "COMPOSANTS": Cpu,
  "ECRANS": Monitor,
  // Fallbacks for other potential categories
  "CABLES": Cable,
  "SOURIS": Mouse,
  "STOCKAGE": HardDrive,
  "USB": Usb,
  "AUDIO": Headphones,
  "MONTRES": Watch,
};

const CategorySectionOne = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category");

      if (error) throw error;

      // Group by category and count
      const categoryMap = new Map<string, number>();
      
      data?.forEach((product) => {
        const cat = product.category || "Divers";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });

      // Convert to array and take top 8
      const categoryArray = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setCategories(categoryArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    window.location.href = `/shop?category=${encodeURIComponent(category)}&page=1`;
  };

  const getIcon = (categoryName: string): React.ElementType => {
    // Direct match first
    if (categoryIcons[categoryName]) {
      return categoryIcons[categoryName];
    }
    
    // Try partial match
    const upperName = categoryName.toUpperCase();
    for (const [key, Icon] of Object.entries(categoryIcons)) {
      if (upperName.includes(key) || key.includes(upperName)) {
        return Icon;
      }
    }
    
    return Keyboard; // Default icon
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -15,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Explorer par catégorie
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nos <span className="text-primary">Catégories</span>
          </h2>
          <p className="text-white/60 max-w-md mx-auto">
            Découvrez notre large sélection de produits organisés par catégorie
          </p>
        </motion.div>

        {/* 3D Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            style={{ perspective: "1000px" }}
          >
            {categories.map((category) => {
              const Icon = getIcon(category.name);
              return (
                <motion.div
                  key={category.name}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    rotateX: 5,
                    z: 50,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(category.name)}
                  className="group cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full overflow-hidden transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(255,204,0,0.15)]">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent transition-all duration-500 rounded-2xl" />
                    
                    {/* Icon Container */}
                    <div className="relative z-10 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-white/50 text-sm">
                        {category.count} produit{category.count > 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>

                    {/* 3D Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,204,0,0.4)]"
          >
            Voir tous les produits
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySectionOne;
