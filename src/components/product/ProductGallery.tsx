"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import ProductImage from "@/components/ui/ProductImage";

interface ProductGalleryProps {
  images: string[];
  isInModal: boolean;
}

const ProductGallery = ({ images, isInModal }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images?.[0] || "");

  const handleImageSelection = (image: string) => {
    setSelectedImage(image);
  };

  return (
    <div className="">
      <div
        className={cn(
          "relative w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-neutral-800",
          isInModal
            ? "w-full lg:min-w-[30rem] h-[15rem] lg:h-[25rem]"
            : "w-full lg:min-w-[30rem] h-[20rem] lg:h-[30rem]"
        )}
      >
        <ProductImage
          src={selectedImage}
          alt="product"
          fill
          className="object-contain"
        />
      </div>
      {images && images.length > 1 && (
        <div className="flex items-center gap-2 p-2 overflow-auto hide-scrollbar mt-2">
          {images.map((image, index) => (
            <div
              key={image || index}
              onClick={() => handleImageSelection(image)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border cursor-pointer bg-gray-100 dark:bg-neutral-800",
                image === selectedImage && "ring-2 ring-primary"
              )}
            >
              <ProductImage
                src={image}
                alt="product thumbnail"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
