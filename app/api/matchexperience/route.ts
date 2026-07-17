import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, MATCHES } from "@/lib/mockData";
import { buildItinerary } from "@/lib/ai";

export async function GET() {
  return NextResponse.json({ recommendations: getRecommendations(), matches: MATCHES });
}

export async function POST(req: NextRequest) {
  const { interests = [], timeBudgetMinutes = 45 } = await req.json().catch(() => ({}));
  const itinerary = await buildItinerary({ interests, timeBudgetMinutes });
  return NextResponse.json({ itinerary });
}
