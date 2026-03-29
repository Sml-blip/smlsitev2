import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BACKUP_DIR = path.join(process.cwd(), "data", "backup");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "products");

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

// GET - Get backup status
export async function GET() {
  try {
    await ensureDirectories();
    
    // Check if backup exists
    const backupPath = path.join(BACKUP_DIR, "products.json");
    let backupExists = false;
    let backupDate = null;
    let backupCount = 0;

    try {
      const stats = await fs.stat(backupPath);
      backupExists = true;
      backupDate = stats.mtime.toISOString();
      const data = JSON.parse(await fs.readFile(backupPath, "utf-8"));
      backupCount = data.length;
    } catch {
      // No backup exists
    }

    // Count images
    let imageCount = 0;
    try {
      const files = await fs.readdir(IMAGES_DIR);
      imageCount = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')).length;
    } catch {
      // No images
    }

    // Get current DB count
    const { count: dbCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      backup: {
        exists: backupExists,
        date: backupDate,
        productCount: backupCount,
      },
      images: {
        count: imageCount,
      },
      database: {
        productCount: dbCount || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - Create backup
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        await ensureDirectories();
        
        send({ type: "info", message: "🚀 Démarrage de la sauvegarde..." });

        // Fetch all products
        const { data: products, error } = await supabase
          .from("products")
          .select("*")
          .order("id");

        if (error) {
          send({ type: "error", message: `Erreur DB: ${error.message}` });
          controller.close();
          return;
        }

        send({ type: "info", message: `📦 ${products?.length || 0} produits trouvés` });

        // Save products JSON
        const backupPath = path.join(BACKUP_DIR, "products.json");
        await fs.writeFile(backupPath, JSON.stringify(products, null, 2));
        send({ type: "success", message: "✅ Données JSON sauvegardées" });

        // Download images
        send({ type: "info", message: "🖼️ Téléchargement des images..." });
        
        let downloaded = 0;
        let failed = 0;
        const updatedProducts = [];

        for (const product of products || []) {
          const images = product.images;
          if (!images || images.length === 0) {
            updatedProducts.push(product);
            continue;
          }

          // Parse images array
          let imageUrls: string[] = [];
          try {
            imageUrls = typeof images === "string" ? JSON.parse(images) : images;
          } catch {
            imageUrls = [images];
          }

          const localImages: string[] = [];

          for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            
            // Skip if already local
            if (imageUrl.startsWith("/images/products/")) {
              localImages.push(imageUrl);
              continue;
            }

            try {
              // Generate local filename
              const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
              const filename = `product-${product.id}-${i}.${ext}`;
              const localPath = path.join(IMAGES_DIR, filename);
              const publicPath = `/images/products/${filename}`;

              // Download image
              const response = await fetch(imageUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
              });

              if (response.ok) {
                const buffer = Buffer.from(await response.arrayBuffer());
                await fs.writeFile(localPath, buffer);
                localImages.push(publicPath);
                downloaded++;
              } else {
                localImages.push(imageUrl); // Keep original on failure
                failed++;
              }
            } catch {
              localImages.push(imageUrl); // Keep original on error
              failed++;
            }
          }

          updatedProducts.push({
            ...product,
            images: JSON.stringify(localImages),
            original_images: images, // Keep original for reference
          });

          // Progress update every 10 products
          if ((downloaded + failed) % 10 === 0) {
            send({ 
              type: "progress", 
              message: `📥 Images: ${downloaded} téléchargées, ${failed} échouées`,
              downloaded,
              failed,
            });
          }
        }

        // Save updated products with local image paths
        const backupWithLocalImages = path.join(BACKUP_DIR, "products-local.json");
        await fs.writeFile(backupWithLocalImages, JSON.stringify(updatedProducts, null, 2));

        send({ 
          type: "complete", 
          message: `🎉 Sauvegarde terminée! ${downloaded} images téléchargées, ${failed} échouées`,
          downloaded,
          failed,
          totalProducts: products?.length || 0,
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

// PUT - Restore from backup
export async function PUT(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        send({ type: "info", message: "🔄 Restauration depuis la sauvegarde..." });

        // Read backup file
        const backupPath = path.join(BACKUP_DIR, "products-local.json");
        let products;
        
        try {
          const data = await fs.readFile(backupPath, "utf-8");
          products = JSON.parse(data);
        } catch {
          // Try original backup
          const originalPath = path.join(BACKUP_DIR, "products.json");
          const data = await fs.readFile(originalPath, "utf-8");
          products = JSON.parse(data);
        }

        send({ type: "info", message: `📦 ${products.length} produits à restaurer` });

        // Clear existing products
        send({ type: "info", message: "🗑️ Suppression des produits existants..." });
        await supabase.from("products").delete().gt("id", 0);

        // Insert products in batches
        const batchSize = 50;
        let inserted = 0;

        for (let i = 0; i < products.length; i += batchSize) {
          const batch = products.slice(i, i + batchSize).map((p: Record<string, unknown>) => {
            // Remove id to let DB generate new ones, and remove original_images
            const { id, original_images, ...rest } = p;
            return rest;
          });

          const { error } = await supabase.from("products").insert(batch);
          
          if (error) {
            send({ type: "error", message: `Erreur batch ${i}: ${error.message}` });
          } else {
            inserted += batch.length;
            send({ type: "progress", message: `✅ ${inserted}/${products.length} produits restaurés` });
          }
        }

        send({ 
          type: "complete", 
          message: `🎉 Restauration terminée! ${inserted} produits restaurés`,
          inserted,
        });

      } catch (error) {
        send({ 
          type: "error", 
          message: error instanceof Error ? error.message : "Backup file not found" 
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
