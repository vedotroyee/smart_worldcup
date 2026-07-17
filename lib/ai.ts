import { retrieve, KBDoc } from "@/lib/rag";
import { CrowdSnapshot, Incident, ChatMessage } from "@/types";

/**
 * Single choke point for every LLM call in the app.
 *
 * Production wiring:
 *   - Set OPENAI_API_KEY or GEMINI_API_KEY and flip NEXT_PUBLIC_USE_MOCK_AI=false.
 *   - `callLLM()` below is the only function that needs to change - point it at
 *     `POST https://api.openai.com/v1/chat/completions` (model: gpt-5) or
 *     `POST https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent`.
 *   - Keep the exported helper signatures (conciergeReply, summarizeOperations,
 *     translateText, planEmergencyResponse, buildItinerary) stable so routes and
 *     UI never need to change when you swap providers.
 *
 * Mock mode (default, used in this sandbox with no network/API keys) produces
 * deterministic, template-driven answers that are still grounded in the
 * retrieved KB docs + live structured context, so the RAG + reasoning flow is
 * fully exercised end-to-end.
 */

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AI !== "false";

async function callLLM(system: string, prompt: string): Promise<string> {
  if (!USE_MOCK && process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${system}\n\n${prompt}` }]
            }
          ]
        }),
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (e) {
      console.error("Gemini API call failed:", e);
      return mockComplete(system, prompt);
    }
  }
  // Mock fallback - deterministic template response.
  return mockComplete(system, prompt);
}

function mockComplete(system: string, prompt: string): string {
  // Extremely lightweight template engine so the demo works with zero API keys.
  return `${prompt}`;
}

export async function conciergeReply(
  userMessage: string,
  language: string,
  liveContext: { crowd?: CrowdSnapshot }
): Promise<{ reply: string; sources: string[] }> {
  const docs: KBDoc[] = retrieve(userMessage, 3);
  const context = docs.map((d) => `- ${d.title}: ${d.content}`).join("\n");

  const system = `You are the FIFA World Cup 2026 AI Stadium Concierge. Answer in ${language}.
Ground every factual claim in the provided context. If context is insufficient, say so and offer to connect a human volunteer.
Be concise, warm, and actionable. Mention live crowd/wait info when relevant.`;

  const prompt = `User question: "${userMessage}"\n\nRetrieved context:\n${context || "(no matching documents)"}\n\nLive crowd risk: ${
    liveContext.crowd?.overallRisk ?? "unknown"
  }`;

  if (USE_MOCK) {
    const reply = buildMockConciergeReply(userMessage, docs, liveContext.crowd);
    return { reply, sources: docs.map((d) => d.title) };
  }

  const reply = await callLLM(system, prompt);
  return { reply, sources: docs.map((d) => d.title) };
}

function buildMockConciergeReply(
  question: string,
  docs: KBDoc[],
  crowd?: CrowdSnapshot
): string {
  if (docs.length === 0) {
    return "I don't have a confirmed answer for that in the stadium knowledge base yet. I'll connect you with a volunteer who can help - would you like me to notify the nearest one?";
  }
  const lines = docs.map((d) => d.content);
  let answer = lines[0];
  if (lines.length > 1) {
    answer += ` Also: ${lines.slice(1).join(" ")}`;
  }
  if (/queue|wait|crowd|line|busy/i.test(question) && crowd) {
    const busiest = [...crowd.zones].sort((a, b) => b.currentLoad / b.capacity - a.currentLoad / a.capacity)[0];
    answer += ` Right now, ${busiest.name} is the busiest spot (${Math.round(
      (busiest.currentLoad / busiest.capacity) * 100
    )}% capacity) - you may want to avoid it or expect a short wait.`;
  }
  return answer;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (USE_MOCK) {
    return `[${targetLanguage}] ${text}`;
  }
  return callLLM(
    `You are a professional simultaneous translator. Translate the user's text into ${targetLanguage}. Preserve tone and factual meaning exactly. Return only the translation.`,
    text
  );
}

export async function summarizeOperations(input: {
  crowd: CrowdSnapshot;
  incidents: Incident[];
}): Promise<string> {
  const { crowd, incidents } = input;
  if (USE_MOCK) {
    const hot = [...crowd.zones]
      .sort((a, b) => b.currentLoad / b.capacity - a.currentLoad / a.capacity)
      .slice(0, 3)
      .map((z) => `${z.name} (${Math.round((z.currentLoad / z.capacity) * 100)}%)`)
      .join(", ");
    const open = incidents.filter((i) => i.status !== "resolved");
    return (
      `Overall crowd risk is ${crowd.overallRisk.toUpperCase()}. Highest-load zones: ${hot}. ` +
      `${open.length} open incident(s)${
        open.length ? ": " + open.map((i) => `${i.type} at ${i.zoneId} (${i.severity})`).join("; ")
      : "."
      } Recommend rebalancing stewards toward the top-loaded zones and pre-staging medical support if any zone exceeds 90% capacity.`
    );
  }
  return callLLM(
    "You are an operations analyst for a stadium command center. Summarize the situation in 3-4 sentences with concrete recommendations.",
    JSON.stringify(input)
  );
}

export async function planEmergencyResponse(incident: Incident): Promise<{
  plan: string;
  notify: string[];
  languages: string[];
}> {
  const plan = USE_MOCK
    ? mockEmergencyPlan(incident)
    : await callLLM(
        "You are an emergency decision-support system for a stadium. Given an incident, produce: (1) immediate actions, (2) who to notify, (3) an evacuation/containment recommendation if applicable. Be specific and calm.",
        JSON.stringify(incident)
      );
  return {
    plan,
    notify: ["Nearest stewards", "Medical team", "Security control room", incident.severity === "critical" ? "Local emergency services" : "On-call operations manager"].filter(Boolean) as string[],
    languages: ["en", "es", "fr", "ar", "pt", "zh", "hi"],
  };
}

function mockEmergencyPlan(incident: Incident): string {
  const base = `Incident ${incident.id} (${incident.type}, severity ${incident.severity}) detected near zone ${incident.zoneId}.`;
  const actions: Record<Incident["type"], string> = {
    medical: "Dispatch nearest medical team, clear a path from the medical post, keep the area ventilated, ask bystanders to step back.",
    overcrowding: "Temporarily hold entry at the affected gate, open an overflow route, direct stewards to funnel flow toward lower-density concourses.",
    weather: "Monitor wind/lightning sensors, prepare covered-area guidance, be ready to pause outdoor concession service.",
    security: "Cordon a 10m radius, do not touch the item, evacuate immediate vicinity, await security/bomb-disposal clearance if escalated.",
    fire: "Trigger nearest fire suppression zone check, begin phased evacuation from affected section, direct crowd to marked exits away from smoke source.",
    lost_person: "Broadcast description to volunteer network, check nearest help desk and lost-and-found, hold last-seen location for 15 minutes.",
  };
  return `${base} Recommended action: ${actions[incident.type]} Continue monitoring for escalation; reassess severity every 5 minutes.`;
}

export async function buildItinerary(input: {
  interests: string[];
  timeBudgetMinutes: number;
}): Promise<string> {
  if (USE_MOCK) {
    return `Based on your interests (${input.interests.join(", ") || "general fan experience"}) and ${input.timeBudgetMinutes} minutes before kickoff: start at the shortest-queue concession, browse the official store, then head to your gate 20 minutes before kickoff to avoid the pre-match rush.`;
  }
  return callLLM(
    "You are a match-day itinerary planner. Produce a short, time-boxed plan.",
    JSON.stringify(input)
  );
}

export function newMessage(role: ChatMessage["role"], content: string, sources?: string[]): ChatMessage {
  return {
    id: Math.random().toString(36).slice(2),
    role,
    content,
    sources,
    createdAt: new Date().toISOString(),
  };
}
