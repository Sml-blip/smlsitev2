import { removeBackground } from "@imgly/background-removal";

export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string;
  success: boolean;
  error?: string;
}

/**
 * Remove background from an image URL and return a base64 data URL
 */
export async function removeImageBackground(imageUrl: string): Promise<{ blob: Blob; dataUrl: string } | null> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBlob = await response.blob();
    
    // Remove background using @imgly/background-removal
    const resultBlob = await removeBackground(imageBlob, {
      model: "small", // Use small model for faster processing
      output: {
        format: "image/png",
        quality: 0.9,
      },
    });

    // Convert to data URL for preview/storage
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return { blob: resultBlob, dataUrl };
  } catch (error) {
    console.error("Error removing background:", error);
    return null;
  }
}

/**
 * Check if an image URL is already a processed (transparent) image
 */
export function isProcessedImage(url: string): boolean {
  if (!url) return false;
  // Check if it's from our Supabase storage processed folder
  return url.includes("/processed/") || url.includes("-nobg") || url.includes("_processed");
}

/**
 * Generate a processed image filename
 */
export function getProcessedFilename(originalUrl: string, productId: number | string): string {
  const timestamp = Date.now();
  return `processed/product-${productId}-${timestamp}-nobg.png`;
}
