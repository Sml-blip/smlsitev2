import React, { Suspense } from "react";
import HeroBannerOne from "@/components/hero/HeroBannerOne";
import ProductsCollectionOne from "@/components/products/ProductsCollectionOne";
import BannerOne from "@/components/banners/BannerOne";
import BenefitsSection from "@/components/others/BenefitSection";
import Loader from "@/components/others/Loader";
import CategorySectionOne from "@/components/category/CategorySectionOne";
import GalerieSection from "@/components/gallery/GalerieSection";

export type HomePageVariant = "default" | "alternate";

interface HomePageProps {
  variant?: HomePageVariant;
}

const HomePage = ({ variant = "default" }: HomePageProps) => {
  if (variant === "alternate") {
    return <HomePageAlternate />;
  }
  return <HomePageDefault />;
};

const HomePageDefault = () => {
  return (
    <section className="overflow-hidden">
      <HeroBannerOne />
      <GalerieSection />
      <Suspense fallback={<Loader />}>
        <CategorySectionOne />
      </Suspense>
      <BenefitsSection />
      <ProductsCollectionOne />
      <BannerOne />
    </section>
  );
};

const HomePageAlternate = () => {
  const BannerTwo = React.lazy(() => import("@/components/banners/BannerTwo"));
  const HeroBannerTwo = React.lazy(() => import("@/components/hero/HeroBannerTwo"));
  const ProductsCollectionTwo = React.lazy(() => import("@/components/products/ProductsCollectionTwo"));

  return (
    <div className="overflow-hidden">
      <Suspense fallback={<Loader />}>
        <HeroBannerTwo />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <CategorySectionOne />
      </Suspense>
      <BenefitsSection />
      <Suspense fallback={<Loader />}>
        <ProductsCollectionTwo />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <BannerTwo />
      </Suspense>
    </div>
  );
};

export default HomePage;
