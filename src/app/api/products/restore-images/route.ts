import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "product-images";

// List ALL files in bucket using pagination
async function listAllFiles(): Promise<string[]> {
  const allFiles: string[] = [];
  let offset = 0;
  const pageSize = 200;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: pageSize, offset });

    if (error || !data || data.length === 0) break;
    allFiles.push(...data.map((f) => f.name));
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return allFiles;
}

export async function POST() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, images")
    .not("images", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const affected = (products || []).filter(
    (p) =>
      Array.isArray(p.images) &&
      p.images.length > 0 &&
      typeof p.images[0] === "string" &&
      p.images[0].includes("-nobg-")
  );

  if (affected.length === 0) {
    return NextResponse.json({ restored: 0, message: "No nobg images found — already clean." });
  }

  // Load all storage files once
  const allFiles = await listAllFiles();

  let restored = 0;
  let failed = 0;
  const details: string[] = [];

  for (const product of affected) {
    const nobgUrl: string = product.images[0];

    // 1. Check if original exists elsewhere in the images array
    let originalUrl: string | undefined = (product.images as string[]).find(
      (img: string) => !img.includes("-nobg-")
    );

    // 2. Search storage for original file: product-{id}-0-* or product-{id}-*  (not nobg)
    if (!originalUrl) {
      const prefix = `product-${product.id}-`;
      const origFile = allFiles.find(
        (f) => f.startsWith(prefix) && !f.includes("-nobg-")
      );
      if (origFile) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(origFile);
        originalUrl = data.publicUrl;
      }
    }

    // 3. Also check "products/" subfolder
    if (!originalUrl) {
      const { data: subFiles } = await supabase.storage
        .from(BUCKET)
        .list("products", { limit: 50, search: String(product.id) });
      if (subFiles && subFiles.length > 0) {
        const origFile = subFiles.find((f) => !f.name.includes("-nobg-"));
        if (origFile) {
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(`products/${origFile.name}`);
          originalUrl = data.publicUrl;
        }
      }
    }

    if (originalUrl) {
      const restoredImages = [
        originalUrl,
        ...(product.images as string[]).filter(
          (img: string) => img !== originalUrl && !img.includes("-nobg-")
        ),
      ];

      const { error: updateError } = await supabase
        .from("products")
        .update({ images: restoredImages })
        .eq("id", product.id);

      if (updateError) {
        failed++;
        details.push(`❌ ${product.name}: ${updateError.message}`);
      } else {
        restored++;
        details.push(`✅ ${product.name} → restored`);

        // Delete the nobg file
        const fileName = nobgUrl.split(`/object/public/${BUCKET}/`).pop();
        if (fileName) await supabase.storage.from(BUCKET).remove([fileName]);
      }
    } else {
      // No original found anywhere — keep the nobg image as fallback (better than blank)
      failed++;
      details.push(`⚠️ ${product.name} (id:${product.id}): original not found — keeping nobg as fallback`);
    }
  }

  return NextResponse.json({ restored, failed, total: affected.length, details });
}

// GET — preview only
export async function GET() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, images")
    .not("images", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const affected = (products || []).filter(
    (p) =>
      Array.isArray(p.images) &&
      p.images.length > 0 &&
      typeof p.images[0] === "string" &&
      p.images[0].includes("-nobg-")
  );

  return NextResponse.json({
    affected: affected.length,
    products: affected.map((p) => ({
      id: p.id,
      name: p.name,
      nobgImage: (p.images as string[])[0],
    })),
  });
}
