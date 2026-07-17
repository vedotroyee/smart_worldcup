import { NextRequest, NextResponse } from "next/server";
import { conciergeReply } from "@/lib/ai";
import { getCrowdSnapshot } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  const { message, language = "en" } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const crowd = getCrowdSnapshot();
  const { reply, sources } = await conciergeReply(message, language, { crowd });

  return NextResponse.json({ reply, sources, timestamp: new Date().toISOString() });
}
