import { NextRequest, NextResponse } from "next/server";
import { memGetConfig, memSetWinMode, memGetPlays, memClearPlays, memAddWhitelist } from "@/lib/eidGame";

export async function GET() {
  const config = memGetConfig();
  const plays = memGetPlays();
  return NextResponse.json({ ...config, plays });
}

export async function POST(req: NextRequest) {
  let body: { winMode?: boolean; action?: "clear" | "whitelist"; phone?: string; ip?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.action === "clear") {
    memClearPlays();
    return NextResponse.json({ ok: true });
  }

  if (body.action === "whitelist") {
    memAddWhitelist(body.phone, body.ip);
    return NextResponse.json({ ok: true });
  }

  if (typeof body.winMode === "boolean") {
    memSetWinMode(body.winMode);
    return NextResponse.json({ ok: true, winMode: body.winMode });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
