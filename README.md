# WC26 Stadium AI Platform

A working prototype of a GenAI platform for FIFA World Cup 2026 stadium
operations and fan experience — AI Concierge, Crowd Intelligence, Transport
Planner, Accessibility Assistant, Sustainability Engine, Operations Command
Dashboard, Emergency Decision Support, and Match Experience recommendations,
all wired to one RAG + LLM layer.

Full architecture write-up: **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the role selector in the top bar to switch
between **Fan**, **Volunteer**, and **Admin** views (Admin/Volunteer unlocks
the Command Dashboard and Emergency module).

Runs out of the box with **zero API keys** — every "AI" call goes through
`lib/ai.ts`, which falls back to deterministic, RAG-grounded template
responses (`NEXT_PUBLIC_USE_MOCK_AI=true` by default) so the full flow — RAG
retrieval → live-data grounding → generation — is exercised without any paid
API.

## Going from mock to live AI

1. Copy `.env.example` to `.env.local` and add `OPENAI_API_KEY` (or wire the
   Gemini branch — the fetch call is stubbed out with a comment in
   `lib/ai.ts` → `callLLM`).
2. Set `NEXT_PUBLIC_USE_MOCK_AI=false`.
3. Replace `lib/rag.ts` → `retrieve()` with a real Pinecone/Weaviate/Chroma
   client call. The function signature (`(query, k) => KBDoc[]`) is the only
   contract the rest of the app depends on.
4. Swap `lib/mockData.ts` functions for real DB/Redis/IoT/transit/weather
   calls one at a time — every API route already reads through these
   functions, so no route or page code needs to change.

## Project layout

See the "Folder Structure" section in `ARCHITECTURE.md`. Short version:
- `app/*/page.tsx` — one page per stakeholder module.
- `app/api/*/route.ts` — the server API each page calls.
- `lib/ai.ts` — the only file that talks to an LLM.
- `lib/rag.ts` — the knowledge base + retrieval (swap for a vector DB later).
- `lib/mockData.ts` — every simulated data source (crowd, transport, weather,
  incidents, volunteers) — swap for real integrations later.
- `lib/auth.tsx` — mock role-based session (swap for real auth later).

## Notes on the UI
Kept deliberately simple/functional per request — dark glassmorphic base
styling lives in `app/globals.css` + `tailwind.config.ts` if you want to
restyle it further in Antigravity; every page is plain Tailwind so it's easy
to hand-edit.

## Deploying
`npm run build && npm start`, or containerize with a standard Next.js
Dockerfile and deploy to Cloud Run / ECS / Vercel. No database is required to
run the demo; wire `DATABASE_URL`/`REDIS_URL` from `.env.example` when you
move persistence out of the in-memory mocks.
