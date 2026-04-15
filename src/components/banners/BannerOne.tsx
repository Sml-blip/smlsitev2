import Image from "next/image";
import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const BannerOne = () => {
  return (
    <section className="relative w-full bg-gradient-to-br from-yellow-50 via-white to-yellow-50 py-4 border-t border-yellow-100">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex flex-col-reverse lg:flex-row items-center justify-between">
        <div className="flex flex-col justify-center items-center text-center lg:text-left lg:w-1/2">
          <h2 className="text-3xl lg:text-5xl text-center font-bold text-gray-900 mt-4 leading-tight">
            Découvrez les derniers gadgets
            <br className="hidden lg:block" /> avec des offres exceptionnelles !
          </h2>
          <p className="text-gray-600 text-lg mt-4">
            Explorez une large gamme d&apos;électronique à des prix imbattables.
          </p>
          <Link 
            href="/shop" 
            className="flex items-center justify-center gap-2 mt-8 px-10 py-4 hover:ring-2 hover:ring-primary hover:ring-opacity-50 text-lg font-semibold rounded-full bg-primary text-black hover:bg-primary/80 transition duration-300 ease-in-out"
          >
            <ArrowRight size={24} /> Acheter maintenant
          </Link>
        </div>
        <div className="relative lg:w-1/2  lg:mt-0">
          <div className="rounded-xl overflow-hidden relative w-[20rem] lg:w-[30rem] h-[15rem] lg:h-[25rem] ">
            <Image src="/images/banner/headphone.png" className="object-contain" fill alt="Electronics Banner" />
          </div>
          <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center animate-blob1">
            <div className="w-24 h-24 bg-primary rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerOne;
