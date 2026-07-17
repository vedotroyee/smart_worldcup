import { NextResponse } from "next/server";
import { getCrowdSnapshot, VOLUNTEERS } from "@/lib/mockData";
import { summarizeOperations } from "@/lib/ai";
import type { Incident } from "@/types";

export async function GET() {
  const crowd = getCrowdSnapshot();
  // Pull the same in-memory log the emergency route uses in a real app this
  // would be one shared data layer (Postgres + Redis cache), not two modules.
  const incidents: Incident[] = [];
  const summary = await summarizeOperations({ crowd, incidents });

  return NextResponse.json({
    crowd,
    volunteers: VOLUNTEERS,
    aiSummary: summary,
  });
}
