"use client";
import React from "react";
import { Truck, RefreshCcw, Shield, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Truck,
    title: "Livraison Rapide",
    description: "Livraison partout en Tunisie dans les meilleurs délais.",
  },
  {
    icon: RefreshCcw,
    title: "Retours Faciles",
    description: "Retournez tout article sous 14 jours pour un remboursement.",
  },
  {
    icon: Shield,
    title: "Garantie Qualité",
    description: "Tous nos produits sont garantis et de qualité premium.",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "Notre équipe est disponible pour vous aider à tout moment.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
