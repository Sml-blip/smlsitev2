"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface ProductImageProps {
  src: string | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const ProductImage = ({ 
  src, 
  alt, 
  fill = false, 
  width, 
  height, 
  className = "",
  priority = false
}: ProductImageProps) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-white dark:bg-black border border-black/5 dark:border-white/5 ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined}>
        <div className="flex flex-col items-center justify-center text-black/30 dark:text-white/30 p-4">
          <Package size={48} strokeWidth={1} />
          <span className="text-xs mt-2 text-center">Image non disponible</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`flex items-center justify-center bg-white dark:bg-black animate-pulse ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined}>
          <Package size={32} className="text-black/20 dark:text-white/20" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        priority={priority}
        unoptimized
      />
    </>
  );
};

export default ProductImage;
