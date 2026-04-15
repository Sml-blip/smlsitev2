import { NextRequest, NextResponse } from "next/server";
import { memCheckEligible, memRecordPlay } from "@/lib/eidGame";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  let body: { phone?: string; name?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const phone = body.phone?.trim() ?? "";
  const name = body.name?.trim() ?? "";

  if (!phone) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  // Re-check eligibility atomically
  const { eligible, reason } = memCheckEligible(phone, ip);
  if (!eligible) {
    return NextResponse.json({ error: "blocked", reason }, { status: 403 });
  }

  const result = memRecordPlay(phone, ip, name);
  return NextResponse.json({ result });
}
