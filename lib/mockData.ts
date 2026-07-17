import type {
  Zone,
  CrowdSnapshot,
  TransportOption,
  ParkingLot,
  Incident,
  Volunteer,
  MatchInfo,
  Recommendation,
  SustainabilityStats,
} from "@/types";

/**
 * Everything in this file simulates data that would, in production, come from:
 *  - IoT occupancy sensors / turnstile counters (Zone.currentLoad)
 *  - Stadium CAD / GIS data (Zone.x, Zone.y)
 *  - Transit agency + ride-share + parking operator APIs (TransportOption, ParkingLot)
 *  - CCTV/computer-vision anomaly detection + staff radios (Incident)
 *  - HR / workforce management systems (Volunteer)
 *  - FIFA match schedule feed (MatchInfo)
 *  - Weather API (see getWeather)
 *
 * Swap these functions for real API/DB calls without touching the UI layer -
 * every component consumes these through the /api/* routes only.
 */

export const STADIUM_ZONES: Zone[] = [
  { id: "gate-a", name: "Gate A - North", kind: "gate", x: 50, y: 6, capacity: 4000, currentLoad: 3400, accessible: true },
  { id: "gate-b", name: "Gate B - East", kind: "gate", x: 92, y: 50, capacity: 3500, currentLoad: 1200, accessible: true },
  { id: "gate-c", name: "Gate C - South", kind: "gate", x: 50, y: 94, capacity: 4000, currentLoad: 3900, accessible: false },
  { id: "gate-d", name: "Gate D - West", kind: "gate", x: 8, y: 50, capacity: 3500, currentLoad: 2100, accessible: true },
  { id: "concourse-n", name: "North Concourse", kind: "concourse", x: 50, y: 20, capacity: 6000, currentLoad: 5200, accessible: true },
  { id: "concourse-s", name: "South Concourse", kind: "concourse", x: 50, y: 80, capacity: 6000, currentLoad: 3000, accessible: true },
  { id: "food-1", name: "Taste of the World Court", kind: "concession", x: 30, y: 30, capacity: 500, currentLoad: 470, waitMinutes: 22, accessible: true },
  { id: "food-2", name: "Green Bites Kiosk", kind: "concession", x: 70, y: 30, capacity: 300, currentLoad: 120, waitMinutes: 4, accessible: true },
  { id: "food-3", name: "Fan Grill South", kind: "concession", x: 30, y: 70, capacity: 400, currentLoad: 260, waitMinutes: 9, accessible: true },
  { id: "merch-1", name: "Official Store", kind: "concession", x: 70, y: 70, capacity: 350, currentLoad: 340, waitMinutes: 18, accessible: true },
  { id: "restroom-1", name: "Restroom N1", kind: "restroom", x: 40, y: 15, capacity: 60, currentLoad: 55, accessible: true },
  { id: "restroom-2", name: "Restroom S1", kind: "restroom", x: 60, y: 85, capacity: 60, currentLoad: 20, accessible: true },
  { id: "medical-1", name: "Medical Post 1", kind: "medical", x: 20, y: 50, capacity: 20, currentLoad: 3, accessible: true },
  { id: "parking-1", name: "Lot P1", kind: "parking", x: 5, y: 90, capacity: 1200, currentLoad: 1100, accessible: true },
  { id: "exit-1", name: "Exit Ramp West", kind: "exit", x: 15, y: 60, capacity: 5000, currentLoad: 800, accessible: true },
];

function jitter(base: number, spread: number) {
  return Math.max(0, Math.round(base + (Math.random() - 0.5) * spread));
}

export function getCrowdSnapshot(): CrowdSnapshot {
  const zones = STADIUM_ZONES.map((z) => ({
    ...z,
    currentLoad: Math.min(z.capacity, jitter(z.currentLoad, z.capacity * 0.06)),
  })).map((z) => ({
    ...z,
    waitMinutes:
      z.kind === "concession"
        ? Math.max(1, Math.round((z.currentLoad / z.capacity) * 25))
        : z.waitMinutes,
  }));

  const avgLoad =
    zones.reduce((s, z) => s + z.currentLoad / z.capacity, 0) / zones.length;

  const overallRisk: CrowdSnapshot["overallRisk"] =
    avgLoad > 0.9 ? "critical" : avgLoad > 0.75 ? "high" : avgLoad > 0.55 ? "moderate" : "low";

  return { timestamp: new Date().toISOString(), zones, overallRisk };
}

export function getTransportOptions(): TransportOption[] {
  return [
    { id: "t1", mode: "metro", label: "Metro Green Line -> Stadium Station", etaMinutes: 18, crowdLevel: "medium", co2SavedGrams: 1800, cost: "$3.50" },
    { id: "t2", mode: "shuttle", label: "Official Fan Shuttle (Downtown Hub)", etaMinutes: 25, crowdLevel: "low", co2SavedGrams: 1500, cost: "Free w/ ticket" },
    { id: "t3", mode: "bus", label: "Express Bus 402", etaMinutes: 30, crowdLevel: "high", co2SavedGrams: 1200, cost: "$2.75" },
    { id: "t4", mode: "rideshare", label: "Shared Ride (Pool)", etaMinutes: 14, crowdLevel: "low", co2SavedGrams: 300, cost: "$9-14" },
    { id: "t5", mode: "walk", label: "Walking path via Riverside Promenade", etaMinutes: 22, crowdLevel: "low", co2SavedGrams: 2000, cost: "Free" },
    { id: "t6", mode: "bike", label: "Bike share dock - Stadium Plaza", etaMinutes: 16, crowdLevel: "low", co2SavedGrams: 1900, cost: "$5" },
    { id: "t7", mode: "car", label: "Personal vehicle via Highway 9", etaMinutes: 20, crowdLevel: "high", co2SavedGrams: 0, cost: "Parking $25" },
  ];
}

export function getParkingLots(): ParkingLot[] {
  return [
    { id: "p1", name: "Lot P1 (North)", distanceMeters: 150, spotsFree: jitter(90, 40), spotsTotal: 1200, evCharging: true },
    { id: "p2", name: "Lot P2 (East)", distanceMeters: 400, spotsFree: jitter(300, 60), spotsTotal: 900, evCharging: false },
    { id: "p3", name: "Remote Lot R1 + Shuttle", distanceMeters: 2200, spotsFree: jitter(700, 100), spotsTotal: 2000, evCharging: true },
  ];
}

let incidentSeq = 100;
export function generateIncident(): Incident {
  incidentSeq += 1;
  const types: Incident["type"][] = ["medical", "overcrowding", "weather", "security", "lost_person"];
  const type = types[Math.floor(Math.random() * types.length)];
  const zone = STADIUM_ZONES[Math.floor(Math.random() * STADIUM_ZONES.length)];
  const severities: Incident["severity"][] = ["low", "medium", "high", "critical"];
  const severity = severities[Math.floor(Math.random() * severities.length)];

  const summaries: Record<Incident["type"], string> = {
    medical: `Possible medical assistance needed near ${zone.name}. Nearest medical post notified.`,
    overcrowding: `Density near ${zone.name} exceeds safe threshold. Recommend opening overflow route.`,
    weather: `Localized weather sensor flags rising wind speed near ${zone.name}.`,
    security: `Unattended item reported near ${zone.name}. Security dispatched for verification.`,
    fire: `Smoke sensor triggered near ${zone.name}. Verify and prep evacuation route.`,
    lost_person: `A guest reported separated from their group near ${zone.name}.`,
  };

  return {
    id: `inc-${incidentSeq}`,
    type,
    zoneId: zone.id,
    severity,
    detectedAt: new Date().toISOString(),
    status: "open",
    aiSummary: summaries[type],
  };
}

export const VOLUNTEERS: Volunteer[] = [
  { id: "v1", name: "Amara N.", role: "Crowd Steward", zoneId: "gate-a", status: "deployed", languages: ["en", "fr"] },
  { id: "v2", name: "Diego R.", role: "Accessibility Guide", zoneId: "gate-d", status: "available", languages: ["en", "es"] },
  { id: "v3", name: "Priya S.", role: "First Aid", zoneId: "medical-1", status: "available", languages: ["en", "hi", "bn"] },
  { id: "v4", name: "Wei L.", role: "Transport Marshal", zoneId: "parking-1", status: "break", languages: ["en", "zh"] },
  { id: "v5", name: "Fatima K.", role: "Crowd Steward", zoneId: "gate-c", status: "deployed", languages: ["en", "ar"] },
];

export const MATCHES: MatchInfo[] = [
  { id: "m1", home: "Brazil", away: "Portugal", kickoff: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), stadium: "MetLife Stadium", status: "upcoming" },
  { id: "m2", home: "Argentina", away: "Germany", kickoff: new Date(Date.now() + 26 * 3600 * 1000).toISOString(), stadium: "AT&T Stadium", status: "upcoming" },
];

export function getRecommendations(): Recommendation[] {
  return [
    { id: "r1", category: "food", title: "Green Bites Kiosk", description: "Plant-forward menu, shortest queue right now (4 min).", zoneId: "food-2", etaMinutes: 4, matchScore: 0.94 },
    { id: "r2", category: "merchandise", title: "Official Store - Away Kit Restock", description: "Away jerseys just restocked, moderate queue.", zoneId: "merch-1", etaMinutes: 18, matchScore: 0.81 },
    { id: "r3", category: "activity", title: "Fan Zone Pre-Match Trivia", description: "Live trivia at North Concourse, starts in 20 minutes.", zoneId: "concourse-n", etaMinutes: 20, matchScore: 0.76 },
    { id: "r4", category: "facility", title: "Quietest restroom nearby", description: "Restroom S1 has the shortest wait (low load).", zoneId: "restroom-2", etaMinutes: 6, matchScore: 0.88 },
  ];
}

export function getSustainabilityStats(): SustainabilityStats {
  return {
    co2SavedKg: 482.6,
    bottlesReused: 3210,
    greenPoints: 1540,
    ranking: 128,
    totalFans: 41230,
  };
}

export function getWeather() {
  return {
    tempC: 27,
    condition: "Partly cloudy",
    windKph: 14,
    heatRisk: "moderate" as "low" | "moderate" | "high",
    lastUpdated: new Date().toISOString(),
  };
}
