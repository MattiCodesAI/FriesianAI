# FriesianAI

**A premium personal AI assistant.** Chat is the product — a quiet, powerful workspace lives one keystroke away.

Open the app and you get a distraction-free AI interface: the Friesian mark, *"How can I help you today?"*, one beautiful input. Projects, files, notes, and memory exist — inside a workspace that slides in only when you ask for it (`⌘.`).

## What's inside

- **AI-first first impression** — centered logo, hero input, suggestion chips (Code · Research · Reason · Analyze · Write · Plan). No dashboards, no panels.
- **Luxurious chat** — assistant replies render as clean typographic text beside the mark; your messages sit in soft containers. Markdown, syntax-highlighted code blocks with copy, message copy/edit/regenerate, streaming with stop, drag-and-drop attachments with inline image previews, auto-growing input.
- **Minimal sidebar** — new chat, search, date-grouped history (Today / Yesterday / …), pinned chats, profile. Nothing else.
- **Hidden workspace** — slides in from the right, resizable and closable, lazy-loaded. Sections: Projects (each with chats, files, notes, instructions, default model), Files, Notes, **Memory**, Bookmarks, Recent.
- **Long-term memory (real, not a placeholder)** — curated memories are assembled into every chat's system context via the orchestration layer.
- **Model abstraction** — OpenAI, Anthropic, Google, OpenRouter, and local models behind one registry; responses are simulated locally so the full streaming pipeline works with zero keys.
- **Performance** — lazy workspace, memoized message rows, CSS content-visibility virtualization for long histories, stable store selectors (no render loops).
- **Backend scaffold** — Fastify + TypeScript + zod with a PostgreSQL/Prisma schema and an SSE chat endpoint.

## Quick start

Requires **Node 20+**.

```bash
npm install
npm run dev          # → http://localhost:5173
```

The frontend is fully functional standalone (state persists locally; AI responses are simulated). The API server is optional:

```bash
cp apps/server/.env.example apps/server/.env   # point DATABASE_URL at PostgreSQL
npm run db:generate && npm run db:migrate
npm run dev:server                             # → http://localhost:4000
```

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘/Ctrl K` | Search & command palette |
| `⌘/Ctrl N` | New chat |
| `⌘/Ctrl .` | Open / close workspace |
| `⌘/Ctrl ⇧ P` | New project |
| `⌘/Ctrl /` | Focus chat input |
| `⌘/Ctrl B` | Toggle sidebar |
| `Esc` | Close dialogs |

## Repository layout

```
apps/
  web/       React 19 + Vite + Tailwind v4 + Zustand + TanStack Query + Framer Motion
  server/    Fastify + TypeScript + Prisma (PostgreSQL)
```

[ARCHITECTURE.md](./ARCHITECTURE.md) maps the codebase onto the FriesianAI layered architecture (orchestration, providers, memory, knowledge, planning, integrations, …) and documents every extension point.

## Going live with real models

1. Implement `streamChat` in `apps/server/src/ai/providers/<vendor>.ts` with the vendor SDK; register it in the server registry. Keys stay in `apps/server/.env`.
2. Point the matching web provider (`apps/web/src/services/ai/providers/<vendor>.ts`) at `POST /api/chat` (SSE).

No UI changes required.
