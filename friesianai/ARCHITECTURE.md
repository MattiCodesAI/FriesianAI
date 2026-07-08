# FriesianAI — Architecture

FriesianAI is designed as a layered AI operating system. This document maps today's codebase onto those layers, explains the boundaries that keep it maintainable, and marks the extension point for every future capability. Unfinished systems get seams, not placeholder UI.

## Product principles

1. **Chat is the product.** The app opens into a distraction-free assistant. The workspace (projects, files, notes, memory) is secondary and hidden until explicitly opened.
2. **UI never knows about vendors.** Components talk to `chatService`; a registry resolves models to providers. Adding a provider touches zero UI files.
3. **Server-state vs client-state stay separate.** Zustand owns interactive state (conversations, streaming, layout); TanStack Query fronts repository data (files, notes, memories, prompts) — localStorage today, HTTP API tomorrow, no component changes.
4. **Same domain shapes end-to-end.** `apps/web/src/types` mirrors the Prisma schema.

## Layer map (architecture → code)

| Layer | Today | Extension point |
| --- | --- | --- |
| 1 · User Interface | Chat, home, sidebar, workspace panel, settings | `components/workspace/sections/index.ts` — one registry entry + component per new surface (Knowledge, Tasks, Integrations, …) |
| 2 · Orchestration | `services/orchestration/contextAssembly.ts` builds system context (instructions + memories) | Intent detection, tool invocation, RAG retrieval slot into the same assembly pipeline |
| 3 · AI Providers | `services/ai/` registry + 5 providers (simulated streaming); server mirror in `apps/server/src/ai` | New vendor = one provider file + catalog entries; capability routing hangs off `ModelInfo` |
| 4 · Memory | Real: `memoriesRepo` + workspace Memory section; injected into every chat | Confidence, versioning, semantic retrieval extend the `MemoryEntry` type + repo |
| 5 · Knowledge | File metadata with `indexed` flag | pgvector + `Embedding` model (see schema comments); swap `searchService` internals — signature unchanged |
| 6 · Planning | — | New repo + workspace section; deadlines/tasks join the Prisma schema alongside Note |
| 7 · Integrations | — | New server modules + a connections table; surfaces register as workspace sections |
| 8–10 · Automation / Research / Learning | — | Services beside `chatService`, consuming the same provider registry |
| 11–13 · Security / Observability / Platform | Keys server-side (`.env`), zod at every API edge | Audit/trace hooks belong in the orchestration pipeline |

## Frontend (`apps/web`)

```
src/
  components/
    ui/          17 primitives (Button, Dialog, Dropdown, Tabs, Toast, HorseLogo, …)
    layout/      AppShell, ResizeHandle
    sidebar/     Sidebar (history, pinned, profile), ConversationItem
    topbar/      TopBar (model selector + workspace toggle), ModelSelector
    chat/        ChatView, MessageList, MessageItem, MarkdownRenderer, CodeBlock,
                 ChatInput, AttachmentList, TypingIndicator
    workspace/   WorkspacePanel (lazy) + sections/ registry
                 (Projects, Files, Notes, Memory, Bookmarks, Recent)
    panels/      project-scoped tabs reused inside Projects (Files, Notes, About)
    projects/    CreateProjectDialog
    search/      CommandPalette
  hooks/         useTheme, useKeyboardShortcuts, useAutoScroll, queries (React Query), …
  pages/         HomePage, ConversationPage, SettingsPage, NotFoundPage
  services/
    ai/            provider abstraction (types, registry, providers/*, chatService)
    orchestration/ context assembly (Layer 2 seam)
    repositories/  localStorage-backed data access with API-shaped interfaces
    attachments.ts session-scoped attachment previews
    searchService  global search façade (future: embedding-backed)
    api/           typed HTTP client for the API swap
  store/         zustand: chat, workspace (projects), ui (layout), settings, toast
  types/         domain types (single source of truth)
  constants/     model catalog, project presets, shortcuts, seed data
  styles/        design tokens (deep charcoal / soft gray-blue) + base styles
```

### Store discipline (the render-loop rules)

- **Selectors must return stable references.** Never `.filter/.map/.sort` or `?? []` inside a selector — select raw arrays and derive with `useMemo`, or use shared constants (`NO_MESSAGES`). This is what prevents "maximum update depth exceeded" with `useSyncExternalStore`.
- Ephemeral values (abort controllers, timers) live outside store state.
- Persisted stores carry a `version` + `migrate` so shape changes never crash returning users; dangling `streaming` messages are finalized on rehydrate.
- Cross-store writes happen in actions/services via `getState()`, never in render.

### Chat pipeline

```
ChatInput ──send──▶ chatStore.sendMessage
                     ├─ assembleSystemPrompt()   (orchestration: instructions + memories)
                     ├─ chatService.streamChat() (provider registry)
                     └─ per-token patches → MessageItem (memoized)
```

Streaming is an `AsyncGenerator<StreamChunk>` end-to-end — identical contract in the browser providers and the server's SSE endpoint, so going live is a transport swap.

### Performance

- Workspace panel is `React.lazy` — the chat never pays for it.
- Message rows are memoized and use CSS `content-visibility: auto` (off-screen turns skip layout/paint; intrinsic-size keeps the scrollbar stable).
- Attachments render via session object-URLs; metadata persists, binaries don't.

### Design system

Tokens are CSS variables surfaced through Tailwind v4's `@theme inline` — deep charcoal surfaces, soft gray-blue text ramp, one muted accent, hairline borders used sparingly (background contrast does the separating). Dark is default and applied pre-paint; light and system are supported. Motion is Framer Motion, 120–260 ms ease-out, entrance + slide only.

## Backend (`apps/server`)

Fastify + TypeScript, modular routes (projects, conversations, files, notes, search, chat), zod validation at the edge, PostgreSQL via Prisma (`Project ⇒ Conversation ⇒ Message`, `Project ⇒ File | Note | PinnedPrompt`, cascade deletes, hot-path indexes). `POST /api/chat` streams SSE with the shared `StreamChunk` contract. Schema comments document the pgvector/memory/multi-user growth path.

## Conventions

Strict TypeScript everywhere; named exports; one component per file; `@/` alias; comments explain *why*. Every list has loading (Skeleton), empty (EmptyState), and error (ErrorBoundary) states — no blank screens.
