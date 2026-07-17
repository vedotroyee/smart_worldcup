import { NextResponse } from "next/server";
import { getSustainabilityStats, getTransportOptions } from "@/lib/mockData";

export async function GET() {
  const stats = getSustainabilityStats();
  const greenTransport = getTransportOptions()
    .filter((t) => t.co2SavedGrams > 1000)
    .sort((a, b) => b.co2SavedGrams - a.co2SavedGrams);

  return NextResponse.json({ stats, greenTransport });
}
