export type Role = "fan" | "volunteer" | "admin";

export interface Zone {
  id: string;
  name: string;
  kind: "gate" | "concourse" | "concession" | "restroom" | "parking" | "medical" | "exit";
  x: number; // % position on stadium map, 0-100
  y: number;
  capacity: number;
  currentLoad: number; // people currently estimated in zone
  waitMinutes?: number;
  accessible: boolean;
}

export interface CrowdSnapshot {
  timestamp: string;
  zones: Zone[];
  overallRisk: "low" | "moderate" | "high" | "critical";
}

export interface TransportOption {
  id: string;
  mode: "metro" | "bus" | "shuttle" | "rideshare" | "walk" | "bike" | "car";
  label: string;
  etaMinutes: number;
  crowdLevel: "low" | "medium" | "high";
  co2SavedGrams: number;
  cost: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  distanceMeters: number;
  spotsFree: number;
  spotsTotal: number;
  evCharging: boolean;
}

export interface Incident {
  id: string;
  type: "medical" | "overcrowding" | "weather" | "security" | "fire" | "lost_person";
  zoneId: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: string;
  status: "open" | "responding" | "resolved";
  aiSummary: string;
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  zoneId: string;
  status: "available" | "deployed" | "break";
  languages: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language?: string;
  sources?: string[];
  createdAt: string;
}

export interface MatchInfo {
  id: string;
  home: string;
  away: string;
  kickoff: string;
  stadium: string;
  status: "upcoming" | "live" | "finished";
}

export interface Recommendation {
  id: string;
  category: "food" | "merchandise" | "activity" | "facility";
  title: string;
  description: string;
  zoneId: string;
  etaMinutes: number;
  matchScore: number;
}

export interface SustainabilityStats {
  co2SavedKg: number;
  bottlesReused: number;
  greenPoints: number;
  ranking: number;
  totalFans: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  language: string;
  accessibilityNeeds?: string[];
}
