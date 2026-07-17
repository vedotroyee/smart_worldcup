# WC26 Stadium AI Platform — Architecture & Plan

A GenAI platform for FIFA World Cup 2026 stadium operations and fan experience.
This document is the reference plan; `/app`, `/lib`, `/components` in this repo
are a working, runnable implementation of it (mock-AI mode, no API keys needed).

---

## 1. Problem Statement
World Cup stadiums host 60,000-90,000+ people from 100+ countries per match, with
language barriers, unpredictable crowd surges at gates/concessions, complex
multi-modal transport, inconsistent accessibility support, high waste output, and
safety-critical decisions (medical, security, weather, evacuation) that currently
depend on radios, static signage, and siloed dashboards. No single system today
unifies fan-facing guidance, operational intelligence, and emergency response
around one live, reasoning layer.

## 2. Unique Value Proposition
One AI reasoning layer — not eight separate apps — sits on top of live crowd,
transport, weather, and knowledge-base data, and serves every stakeholder from
the same source of truth: fans get a multilingual concierge that reasons over
real conditions; organizers get the same live picture as an operational
dashboard; emergency response gets an AI that drafts action plans in seconds
instead of minutes. It's GenAI-first (RAG + reasoning + generation), not a
chatbot bolted onto a legacy app.

## 3. Complete System Architecture

```
┌─────────────────────────────── Clients ───────────────────────────────┐
│  Fan Web/PWA (Next.js)   Volunteer App   Admin Command Console        │
└───────────────┬───────────────────┬───────────────────┬───────────────┘
                 │  HTTPS / WebSocket │
┌────────────────▼────────────────────────────────────────────────────┐
│                    API Gateway (Next.js Route Handlers /             │
│                    FastAPI or NestJS in a larger deployment)          │
│  /concierge  /crowd  /transport  /emergency  /sustainability          │
│  /matchexperience  /dashboard  /auth                                  │
└───┬─────────────┬──────────────┬───────────────┬──────────────┬──────┘
    │             │              │               │              │
┌───▼───┐   ┌─────▼─────┐  ┌─────▼──────┐  ┌─────▼─────┐  ┌─────▼─────┐
│  LLM  │   │  Vector DB │  │  Postgres  │  │   Redis   │  │  IoT/Event│
│ Gemini│   │ Pinecone/  │  │ (users,    │  │ (live     │  │  Bus      │
│ /GPT-5│   │ Weaviate/  │  │ incidents, │  │ crowd,    │  │ (turnstile│
│ +tools│   │ Chroma     │  │ tickets,   │  │ sessions, │  │ sensors,  │
│       │   │ (KB chunks)│  │ volunteers)│  │ pub/sub)  │  │ CCTV, GPS)│
└───┬───┘   └─────┬──────┘  └─────┬──────┘  └─────┬─────┘  └─────┬─────┘
    │             │                │               │              │
    └─────────────┴────────────────┴───────────────┴──────────────┘
                        External integrations:
      Maps/Traffic (Google Maps/Mapbox) · Weather API · Transit GTFS-RT ·
      Ride-share partner APIs · Parking operator APIs · SMS/Push (FCM/SNS)
```

Data flows one way in: sensors/APIs → Redis (hot) + Postgres (durable) →
AI layer reads both live state and the vector KB → generates responses/plans →
pushed back out over REST (poll) or WebSocket (push) to every client type.

## 4. User Flow (representative)
**Fan:** opens app → sees home hub → asks concierge "where's the shortest food
queue near Gate B?" → concierge retrieves KB + live crowd data → answers with
zone + wait time → fan taps "navigate" → gets AI-ranked transport/walking route
→ earns green points for choosing shuttle → later gets a push alert "your gate
is now less crowded, entry recommended."

**Admin/Volunteer:** logs into command console → sees live heatmap + AI summary
of hot zones → incident fires (e.g. overcrowding at Gate C) → AI emergency
module proposes an action plan + who to notify → admin approves/dispatches →
volunteer list updates in real time → incident marked resolved, feeds back into
the model's situational memory for the rest of the match.

## 5. Database Schema (Postgres, simplified)

```sql
users(id, name, role, language, accessibility_needs text[], created_at)
tickets(id, user_id, match_id, seat, gate_id, status)
matches(id, home, away, kickoff, stadium_id, status)
zones(id, stadium_id, name, kind, capacity, x, y, accessible boolean)
zone_occupancy(zone_id, ts, current_load, source)          -- time-series, high volume
incidents(id, type, zone_id, severity, status, detected_at, resolved_at, ai_summary)
volunteers(id, name, role, zone_id, status, languages text[])
kb_documents(id, title, content, tags text[], lang, updated_at)
kb_embeddings -- lives in the vector DB, not Postgres; kb_documents.id is the join key
chat_sessions(id, user_id, started_at)
chat_messages(id, session_id, role, content, sources text[], created_at)
sustainability_events(id, user_id, kind, co2_saved_g, points, ts)
transport_options(id, mode, label, base_eta, cost)          -- static catalog; live ETA from cache
```
`zone_occupancy` and live positions belong in a time-series-friendly store
(Timescale extension on Postgres, or a stream store) at production scale, not
plain rows.

## 6. API Design (implemented in `/app/api/*`)

| Route | Method | Purpose |
|---|---|---|
| `/api/concierge` | POST | RAG-grounded multilingual Q&A |
| `/api/crowd` | GET | Live zone occupancy snapshot + risk level |
| `/api/transport` | GET | Transit/shuttle/rideshare/parking/weather |
| `/api/emergency` | GET/POST | Incident feed, simulate incident, AI response plan, resolve |
| `/api/sustainability` | GET | Green stats + low-carbon transport ranking |
| `/api/matchexperience` | GET/POST | Recommendations, matches, AI itinerary |
| `/api/dashboard` | GET | Aggregate ops view + AI operations summary |

Production additions: `/api/auth/*` (session issuance), `/api/tickets/*`,
WebSocket channel `/ws/live` for push-based crowd/incident updates instead of
polling, and per-route rate limiting + RBAC middleware.

## 7. AI Pipeline
1. **Ingest** — normalize inputs (chat text, sensor readings, transit feeds).
2. **Retrieve** — vector search over the knowledge base (see §8), filtered by
   language/zone/match metadata.
3. **Ground** — merge retrieved docs with live structured context (crowd
   snapshot, weather, user profile) into a single prompt.
4. **Reason/Generate** — LLM call (function-calling enabled so it can invoke
   live tools like `getCrowdSnapshot`, `getTransportOptions` directly, rather
   than only reading static text).
5. **Post-process** — cite sources, redact anything not grounded, translate if
   needed, convert to speech (TTS) for accessibility.
6. **Act/Log** — write chat + incident logs back to Postgres for audit and to
   improve future retrieval relevance.

`lib/ai.ts` in this repo is the single choke point for all LLM calls — swapping
providers or going from mock to live only touches that one file.

## 8. RAG Architecture
- **Chunking:** stadium ops manuals, FAQs, ticketing policy, accessibility
  guides split into 300-500 token chunks with 50-token overlap.
- **Embedding:** `text-embedding-3-large` (OpenAI) or `embedding-001` (Gemini).
- **Store:** Pinecone/Weaviate/Chroma, metadata `{source, lang, zoneId, updatedAt}`.
- **Retrieval:** top-k similarity search (k=5) + optional cross-encoder rerank,
  filtered by current match/zone/user language.
- **Augmentation:** retrieved chunks + live data injected into the system
  prompt (see `lib/ai.ts` → `conciergeReply`).
- This repo's `lib/rag.ts` implements the same interface with in-memory
  keyword-weighted search, so every caller already matches the production
  contract — only the internals of `retrieve()` change later.

## 9. Folder Structure
```
worldcup-genai-platform/
├── app/
│   ├── page.tsx                     # landing / module hub
│   ├── concierge/page.tsx           # AI Stadium Concierge
│   ├── crowd/page.tsx               # Smart Crowd Intelligence
│   ├── transport/page.tsx           # AI Transportation Planner
│   ├── accessibility/page.tsx       # Accessibility Assistant
│   ├── sustainability/page.tsx      # Sustainability Engine
│   ├── matchday/page.tsx            # AI Match Experience
│   ├── admin/dashboard/page.tsx     # Operations Command Dashboard
│   ├── admin/emergency/page.tsx     # Emergency Decision Support
│   └── api/{concierge,crowd,transport,emergency,sustainability,
│            matchexperience,dashboard}/route.ts
├── components/ (Navbar, ChatWidget, Heatmap, RoleGuard)
├── lib/ (ai.ts, rag.ts, mockData.ts, auth.tsx)
├── types/index.ts
└── ARCHITECTURE.md, README.md
```

## 10. UI/UX Design
Dark, glassmorphic, mobile-first (per your note, kept intentionally simple here
— it's built to be easy to restyle in Antigravity). Consistent pattern per
module: a primary live-data panel (map/chat/table) + a secondary AI-insight
panel. Role switcher in the navbar swaps the fan/volunteer/admin view without
reloading. Voice input + text-to-speech wired into the concierge for
accessibility.

## 11. Tech Stack Justification
- **Next.js/TypeScript** — one codebase for UI + API routes, fast to demo and
  easy to later split the API out into FastAPI/NestJS if you need heavier
  background workers.
- **PostgreSQL** — relational integrity for tickets/incidents/users.
- **Redis** — sub-second reads for live crowd/session state, pub/sub for push.
- **Pinecone/Weaviate/Chroma** — semantic retrieval that scales past keyword
  search across many languages and documents.
- **Gemini/GPT-5/Llama 3.3** — provider flexibility; the abstraction in
  `lib/ai.ts` means you're not locked in.
- **WebSockets/Supabase Realtime** — push, not poll, for crowd/incident feeds.
- **Docker + CI/CD** — reproducible builds across stadiums/venues.

## 12. Implementation Roadmap
- **Week 1-2:** Core data model, mock data (done here), auth, concierge + RAG v1.
- **Week 3-4:** Real crowd/transport/weather integrations, WebSocket push,
  dashboard v1.
- **Week 5-6:** Emergency module, accessibility features (voice, sign-language
  routing), sustainability tracking.
- **Week 7-8:** Load testing at stadium scale, security review, pilot at one
  venue, staff training.

## 13. MVP Features
Concierge chat (RAG + live crowd awareness), crowd heatmap, transport options,
basic accessibility routing, role-based views, one working emergency-plan
generator.

## 14. Advanced Features
Predictive congestion forecasting (short-horizon ML on occupancy time series),
computer-vision-based anomaly detection feeding the incident feed automatically,
live sign-language video routing, dynamic multilingual push notifications,
carbon-aware transport nudges with a rewards ledger.

## 15. Future Scalability
Multi-venue/multi-tournament config (stadium data becomes a tenant), edge
caching for the concierge in low-connectivity zones, federated/anonymized
crowd models across venues, plug-in architecture for new IoT vendors, and a
public API for city transit agencies to consume aggregated (non-PII) demand
signals.

## 16. Hackathon Presentation Points
Lead with the concierge demo (most visceral), then the heatmap (visual "wow"),
then the emergency plan generator (highest perceived stakes). Close on the one
unifying idea: one AI layer, eight stakeholder views, same live data — not
eight disconnected apps.

## 17. Business Impact
Shorter queues and less congestion improve concession revenue capture and repeat
attendance; fewer safety incidents and faster response reduce liability;
volunteer efficiency gains reduce staffing costs; a reusable platform lowers
per-venue rollout cost across the tournament's many host stadiums.

## 18. Sustainability Impact
Nudging fans toward transit/shuttle/bike/walk over solo driving, tracked and
rewarded, plus reuse-station and waste-sorting incentives, gives organizers a
measurable carbon and waste reduction story per match.

## 19. Security & Privacy Considerations
- Never trust client-declared role — every admin/volunteer route must re-check
  the session role server-side (this demo's `RoleGuard` is UI-only; real
  enforcement belongs in the API layer/middleware).
- PII minimization: store only what's needed for tickets/accessibility;
  anonymize/aggregate crowd analytics.
- Rate-limit and log all concierge and emergency endpoints; never let free-text
  input reach a system prompt un-sandboxed (prompt-injection defenses on any
  ingested user or third-party content).
- Encrypt at rest and in transit; short-lived tokens for volunteer/admin
  sessions; audit trail on every incident action.
- Accessibility data (needs, conditions) is sensitive — access-controlled and
  never used outside its stated purpose.

## 20. Development Plan / Code Structure
This repository *is* that structure — production-shaped route handlers, a
single AI/RAG abstraction layer, typed data contracts (`types/index.ts`), and
UI split by stakeholder journey. See `README.md` for how to run it and where to
plug in real providers.
