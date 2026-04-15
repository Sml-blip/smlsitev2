import { NextRequest, NextResponse } from "next/server";
import { memCheckEligible } from "@/lib/eidGame";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") ?? "";
  const ip = getIP(req);

  if (!phone) {
    return NextResponse.json({ eligible: false, reason: "missing_phone" }, { status: 400 });
  }

  const { eligible, reason } = memCheckEligible(phone.trim(), ip);
  return NextResponse.json({ eligible, reason, ip });
}
