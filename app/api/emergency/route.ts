import { NextRequest, NextResponse } from "next/server";
import { generateIncident } from "@/lib/mockData";
import { planEmergencyResponse } from "@/lib/ai";
import type { Incident } from "@/types";

// In-memory incident log for the demo. Production: Postgres table `incidents`
// + a pub/sub channel (Redis/Firebase) that pushes new rows to connected
// dashboards and volunteer devices in real time via WebSockets.
let incidentLog: Incident[] = [generateIncident(), generateIncident()];

export async function GET() {
  return NextResponse.json({ incidents: incidentLog });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (body.action === "simulate") {
    const incident = generateIncident();
    incidentLog = [incident, ...incidentLog].slice(0, 20);
    const response = await planEmergencyResponse(incident);
    return NextResponse.json({ incident, ...response });
  }

  if (body.action === "resolve" && body.id) {
    incidentLog = incidentLog.map((i) => (i.id === body.id ? { ...i, status: "resolved" } : i));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
