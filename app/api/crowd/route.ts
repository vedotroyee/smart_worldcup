import { NextResponse } from "next/server";
import { getCrowdSnapshot } from "@/lib/mockData";

export async function GET() {
  // In production: read from Redis (rolled up from turnstile/IoT stream every 5-10s)
  // and run a short-horizon congestion forecast (e.g. Prophet/LSTM) alongside the
  // raw snapshot so the UI can show "predicted in 10 min" as well as "now".
  const snapshot = getCrowdSnapshot();
  return NextResponse.json(snapshot);
}
