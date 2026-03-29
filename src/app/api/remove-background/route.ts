import { NextResponse } from "next/server";

// Background removal is now handled client-side using @imgly/background-removal
// This endpoint is kept for reference but redirects to the client-side solution

export async function POST() {
  return NextResponse.json({
    error: "Background removal is now processed client-side for unlimited usage.",
    solution: "Use the 'Auto BG Remove' button in the dashboard which processes images locally in your browser.",
    benefits: [
      "No API limits",
      "No API keys needed",
      "Works offline",
      "Faster processing"
    ]
  }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    message: "Background removal API",
    status: "Use client-side processing via dashboard",
    method: "Go to Dashboard > Products > Click 'Auto BG Remove'"
  });
}
