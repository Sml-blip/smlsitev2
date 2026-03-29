import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // List root to find folders
  const { data: root } = await supabase.storage.from("product-images").list("", { limit: 10 });

  // List "products" subfolder
  const { data: sub } = await supabase.storage.from("product-images").list("products", { limit: 10 });

  // Try the nobg URL path directly - extract folder from actual nobg URL
  // URL: .../product-images/product-6411-nobg-...png  → root level, no folder
  // Check if the file actually exists at root
  const testUrl = "https://xezqtbsmyypotovkbole.supabase.co/storage/v1/object/public/product-images/product-6411-nobg-1773061067115.png";
  const testRes = await fetch(testUrl, { method: "HEAD" });

  return NextResponse.json({
    rootSample: root?.slice(0, 5).map((f) => ({ name: f.name, id: f.id })),
    subFolderSample: sub?.slice(0, 5).map((f) => f.name) ?? "no products/ folder",
    nobgFileExists: testRes.status,
  });
}
