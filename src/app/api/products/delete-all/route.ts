import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Secret confirmation code - must match to delete
const DELETION_CODE = "SUPPRIMER-TOUT-2024";

export async function DELETE(request: NextRequest) {
  try {
    // Require confirmation code in request body
    const body = await request.json().catch(() => ({}));
    const { confirmationCode } = body;

    if (!confirmationCode) {
      return NextResponse.json(
        { error: "Confirmation code required", code: "CONFIRMATION_REQUIRED" },
        { status: 400 }
      );
    }

    if (confirmationCode !== DELETION_CODE) {
      return NextResponse.json(
        { error: "Invalid confirmation code", code: "INVALID_CODE" },
        { status: 403 }
      );
    }

    // Get count before deletion for logging
    const { count: beforeCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Perform deletion
    const { error } = await supabase
      .from("products")
      .delete()
      .gt("id", 0);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Log the deletion for audit
    console.log(`[AUDIT] All products deleted. Count before: ${beforeCount}. Time: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${beforeCount} products`,
      deletedCount: beforeCount,
    });
  } catch (error) {
    console.error("Delete all error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete products" },
      { status: 500 }
    );
  }
}

// GET - Return info about the deletion protection
export async function GET() {
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    message: "Delete All Products API",
    protection: "Requires confirmation code",
    hint: "Type 'SUPPRIMER-TOUT-2024' to confirm deletion",
    currentProductCount: count,
  });
}
