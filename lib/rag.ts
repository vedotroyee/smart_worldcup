/**
 * RAG layer (simulated).
 *
 * Production architecture:
 *   1. Ingest: stadium ops manuals, FAQ, ticketing policy, transit schedules,
 *      accessibility guides, multilingual signage text -> chunk (300-500 tokens,
 *      50 token overlap) -> embed (text-embedding-3-large / Gemini embedding-001)
 *      -> upsert into Pinecone/Weaviate/Chroma with metadata { source, lang, zoneId, updatedAt }.
 *   2. Retrieve: embed the user query, similarity search top-k (k=5) filtered by
 *      metadata (e.g. current match, user zone, language), optionally rerank with
 *      a cross-encoder.
 *   3. Augment: inject retrieved chunks + live structured context (crowd snapshot,
 *      weather, transport, user profile) into the LLM system prompt.
 *   4. Generate: call the LLM with function-calling enabled so it can also invoke
 *      live tools (getCrowdSnapshot, getTransportOptions, etc.) rather than only
 *      reading static text.
 *
 * This file stands in for steps 1-2 with an in-memory keyword-weighted search so
 * the rest of the app (API routes, UI) can be wired against a stable interface.
 * Swap `retrieve()` for a real vector DB client without touching callers.
 */

export interface KBDoc {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export const KNOWLEDGE_BASE: KBDoc[] = [
  {
    id: "kb-tickets-1",
    title: "Ticket entry & re-entry policy",
    content:
      "Tickets are mobile-only via the official app. Re-entry is allowed once per match through the same gate you exited. Lost or stolen phones can be resolved at any Fan Help desk with a government ID.",
    tags: ["ticket", "entry", "reentry", "app", "help desk"],
  },
  {
    id: "kb-bag-policy",
    title: "Bag & prohibited items policy",
    content:
      "Clear bags up to 30x30x15 cm are allowed. Outside food and drink, laser pointers, drones, and professional cameras with detachable lenses are prohibited. Medical exceptions are handled at accessible entry lanes.",
    tags: ["bag", "security", "prohibited", "medical exception"],
  },
  {
    id: "kb-accessibility-1",
    title: "Accessibility services",
    content:
      "Wheelchair seating, companion seating, sensory rooms, and assistive listening devices are available. Accessible entrances are at Gate A, Gate B, and Gate D. Sign-language interpretation can be requested 48 hours in advance for stadium tours; live match-day requests are routed to the nearest accessibility volunteer.",
    tags: ["accessibility", "wheelchair", "sensory room", "sign language", "gate"],
  },
  {
    id: "kb-transport-1",
    title: "Getting to the stadium",
    content:
      "The Metro Green Line runs express service to Stadium Station every 6 minutes on match days. Official fan shuttles depart from the Downtown Hub starting 3 hours before kickoff. Rideshare pickup/drop-off is at Lot P3 only.",
    tags: ["metro", "shuttle", "rideshare", "parking", "transport"],
  },
  {
    id: "kb-emergency-1",
    title: "Emergency procedures",
    content:
      "In case of an evacuation announcement, proceed calmly to the nearest marked exit, do not use elevators, and follow steward instructions. Assembly points are at the North and South plazas. Medical posts are located at gates A-D and both concourses.",
    tags: ["emergency", "evacuation", "exit", "medical", "assembly point"],
  },
  {
    id: "kb-sustainability-1",
    title: "Sustainability initiatives",
    content:
      "Refill stations are available at every concession stand; bringing a reusable bottle earns Green Points redeemable for merchandise discounts. Waste sorting stations separate compost, recycling, and landfill. Public transit and shuttle riders automatically earn bonus Green Points.",
    tags: ["sustainability", "reusable bottle", "green points", "recycling", "carbon"],
  },
  {
    id: "kb-food-1",
    title: "Food & concessions",
    content:
      "Concession stands accept contactless payment only. Green Bites Kiosk and Fan Grill South offer vegetarian, vegan, and halal options. Allergen information is available by scanning the QR code at each stand.",
    tags: ["food", "concession", "vegan", "halal", "allergen"],
  },
  {
    id: "kb-lost-found",
    title: "Lost & found and lost persons",
    content:
      "Lost items can be reported at any Fan Help desk or via the app's Lost & Found chat. For a lost child or separated group member, notify the nearest steward immediately; stadium announcements and volunteer network are activated within 2 minutes.",
    tags: ["lost and found", "lost person", "child", "steward"],
  },
];

export function retrieve(query: string, k = 3): KBDoc[] {
  const q = query.toLowerCase();
  const scored = KNOWLEDGE_BASE.map((doc) => {
    let score = 0;
    for (const tag of doc.tags) {
      if (q.includes(tag)) score += 3;
    }
    for (const word of q.split(/\W+/).filter(Boolean)) {
      if (doc.content.toLowerCase().includes(word)) score += 1;
      if (doc.title.toLowerCase().includes(word)) score += 1;
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.doc);
}
