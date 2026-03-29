"use client";
import React, { useEffect, useState } from "react";
import ProductImage from "@/components/ui/ProductImage";
import Countdown from "react-countdown";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getProducts } from "@/lib/products";
import { Product } from "@/types";
import { getProductUrl } from "@/lib/slugify";

const SpecialDeals = ({ textCenter }: { textCenter: boolean }) => {
  const [deals, setDeals] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then((products) => {
      setDeals(products.slice(0, 4));
    });
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <h2
          className={cn(
            "text-3xl lg:text-5xl w-fit mx-auto  mb-12 p-2 font-bold border-l-4 border-primary",
            textCenter ? "text-center" : "text-left"
          )}
        >
          Offres Spéciales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white dark:bg-black border border-border shadow-md rounded-lg overflow-hidden flex flex-col lg:flex-row items-center p-6 lg:p-4 gap-6"
            >
              <div className="relative w-full h-48 lg:w-40 lg:h-40 bg-muted rounded-lg overflow-hidden">
                <ProductImage
                  src={deal.images?.[0]}
                  alt={deal.name}
                  fill
                  className="rounded-lg object-contain lg:object-cover"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <Countdown
                  renderer={({ days, hours, minutes, seconds }) => {
                    return (
                      <div className="py-2 flex items-center gap-3">
                        <div>
                          <p className="text-2xl font-medium">{days < 10 && '0'}{days} :</p>
                          <small>Jours</small>
                        </div>
                        <div>
                          <p className="text-2xl font-medium">{hours < 10 && '0'}{hours} :</p>
                          <small>Heures</small>
                        </div>
                        <div>
                          <p className="text-2xl font-medium">{minutes < 10 && '0'}{minutes} :</p>
                          <small>Minutes</small>
                        </div>
                        <div>
                          <p className="text-2xl font-medium">{seconds < 10 && '0'}{seconds}</p>
                          <small>Secondes</small>
                        </div>
                      </div>
                    );
                  }}
                  date={Date.now() + 7 * 24 * 60 * 60 * 200}
                />

                <h3 className="text-xl font-semibold mb-2">
                  {deal.name.slice(0, 50)}...
                </h3>
                <div className="flex items-center justify-between gap-4 lg:gap-2">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start">
                    <span className="text-muted-foreground text-sm line-through mr-2">
                      {deal.price} TND
                    </span>
                    <span className="text-primary text-xl mx-1 font-bold">
                      {Number(deal.price) - deal.discount} TND
                    </span>
                    <span className="text-sm ml-1 text-black dark:text-white">
                      (-{deal.discount} TND)
                    </span>
                  </div>
                  <Link
                      href={getProductUrl(deal)}
                      className="bg-primary hover:bg-primary/80 text-black px-4 py-2 rounded-lg inline-block text-center whitespace-nowrap font-medium"
                    >
                    Voir l&apos;offre
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialDeals;
