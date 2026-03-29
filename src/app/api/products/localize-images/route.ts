import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 300; // 5 minutes

// POST - Download all external images to Supabase Storage
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        send({ type: "info", message: "🚀 Démarrage de la localisation des images..." });

        // Get all products with external images
        const { data: products, error } = await supabase
          .from("products")
          .select("id, name, images")
          .not("images", "is", null);

        if (error) {
          send({ type: "error", message: `Erreur DB: ${error.message}` });
          controller.close();
          return;
        }

        // Filter products with external images
        const productsWithExternalImages = products?.filter((p) => {
          if (!p.images || p.images.length === 0) return false;
          const firstImage = p.images[0];
          // Skip if already in Supabase
          return !firstImage?.includes("supabase.co") && 
                 !firstImage?.includes("replicate.delivery");
        }) || [];

        send({ type: "info", message: `📦 ${productsWithExternalImages.length} produits avec images externes` });

        if (productsWithExternalImages.length === 0) {
          send({ type: "complete", message: "✅ Toutes les images sont déjà locales!", downloaded: 0, failed: 0 });
          controller.close();
          return;
        }

        let downloaded = 0;
        let failed = 0;

        for (let i = 0; i < productsWithExternalImages.length; i++) {
          const product = productsWithExternalImages[i];
          
          send({ 
            type: "progress", 
            current: i + 1, 
            total: productsWithExternalImages.length,
            product: product.name 
          });

          try {
            const images = product.images;
            const newImages: string[] = [];

            for (let j = 0; j < images.length; j++) {
              const imageUrl = images[j];

              // Skip if already in Supabase
              if (imageUrl?.includes("supabase.co") || imageUrl?.includes("replicate.delivery")) {
                newImages.push(imageUrl);
                continue;
              }

              try {
                // Download image
                const response = await fetch(imageUrl, {
                  headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "image/*,*/*;q=0.8",
                  },
                });

                if (!response.ok) {
                  console.log(`Failed to fetch ${imageUrl}: ${response.status}`);
                  newImages.push(imageUrl); // Keep original
                  continue;
                }

                const contentType = response.headers.get("content-type") || "image/jpeg";
                const buffer = await response.arrayBuffer();

                // Determine file extension
                let ext = "jpg";
                if (contentType.includes("png")) ext = "png";
                else if (contentType.includes("webp")) ext = "webp";
                else if (contentType.includes("gif")) ext = "gif";

                // Generate unique filename
                const filename = `product-${product.id}-${j}-${Date.now()}.${ext}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                  .from("product-images")
                  .upload(filename, buffer, {
                    contentType,
                    upsert: true,
                  });

                if (uploadError) {
                  console.error(`Upload error for ${product.name}:`, uploadError);
                  newImages.push(imageUrl); // Keep original
                  continue;
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                  .from("product-images")
                  .getPublicUrl(filename);

                newImages.push(urlData.publicUrl);
                downloaded++;

              } catch (imgError) {
                console.error(`Error processing image ${j} for ${product.name}:`, imgError);
                newImages.push(imageUrl); // Keep original on error
              }
            }

            // Update product with new images
            const { error: updateError } = await supabase
              .from("products")
              .update({ images: newImages })
              .eq("id", product.id);

            if (updateError) {
              send({ type: "error", message: `❌ ${product.name}: Update failed` });
              failed++;
            } else {
              send({ type: "success", message: `✅ ${product.name}` });
            }

          } catch (productError) {
            send({ type: "error", message: `❌ ${product.name}: ${productError}` });
            failed++;
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        send({ 
          type: "complete", 
          message: `🎉 Terminé! ${downloaded} images téléchargées, ${failed} échecs`,
          downloaded,
          failed,
        });

      } catch (error) {
        send({ 
          type: "error", 
          message: error instanceof Error ? error.message : "Unknown error" 
        });
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// GET - Get status of images
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, images");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let externalCount = 0;
    let localCount = 0;
    let noImageCount = 0;

    products?.forEach((p) => {
      if (!p.images || p.images.length === 0) {
        noImageCount++;
        return;
      }
      const firstImage = p.images[0];
      if (firstImage?.includes("supabase.co") || firstImage?.includes("replicate.delivery")) {
        localCount++;
      } else {
        externalCount++;
      }
    });

    return NextResponse.json({
      total: products?.length || 0,
      external: externalCount,
      local: localCount,
      noImage: noImageCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
