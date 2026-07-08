import type {
  Conversation,
  FileMeta,
  MemoryEntry,
  Message,
  Note,
  PinnedPrompt,
  Project,
} from '@/types';

/**
 * First-run seed data. Loaded once into the persisted stores so the workspace
 * feels alive on first open; everything here can be edited or deleted.
 */

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-personal',
    name: 'Personal',
    kind: 'personal',
    color: 'violet',
    description: 'Everyday questions, planning, and ideas.',
    instructions: '',
    createdAt: iso(90 * 86_400_000),
    updatedAt: iso(2 * 3_600_000),
    hasUnread: false,
  },
  {
    id: 'proj-coding',
    name: 'Coding',
    kind: 'coding',
    color: 'blue',
    description: 'Software projects, code review, and debugging.',
    instructions:
      'Prefer TypeScript. Favor clear, production-quality code with brief explanations.',
    createdAt: iso(60 * 86_400_000),
    updatedAt: iso(30 * 60_000),
    hasUnread: false,
  },
  {
    id: 'proj-research',
    name: 'Research',
    kind: 'research',
    color: 'green',
    description: 'Deep dives, literature notes, and syntheses.',
    instructions: 'Cite sources where possible and separate facts from speculation.',
    createdAt: iso(45 * 86_400_000),
    updatedAt: iso(3 * 86_400_000),
    hasUnread: false,
  },
  {
    id: 'proj-sat',
    name: 'SAT Prep',
    kind: 'sat',
    color: 'amber',
    description: 'Practice questions, strategies, and study plans.',
    instructions: 'Explain answers step by step at a high-school level.',
    createdAt: iso(30 * 86_400_000),
    updatedAt: iso(5 * 86_400_000),
    hasUnread: false,
  },
];

export const DEFAULT_PROJECT_ID = 'proj-coding';

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-welcome',
    projectId: null,
    title: 'Welcome to FriesianAI',
    modelId: 'anthropic/claude-sonnet',
    pinned: true,
    createdAt: iso(2 * 86_400_000),
    updatedAt: iso(30 * 60_000),
  },
  {
    id: 'conv-debounce',
    projectId: 'proj-coding',
    title: 'Debounce a search input in React',
    modelId: 'anthropic/claude-sonnet',
    pinned: false,
    createdAt: iso(86_400_000),
    updatedAt: iso(86_400_000),
  },
  {
    id: 'conv-personal-1',
    projectId: null,
    title: 'Weekly meal planning ideas',
    modelId: 'anthropic/claude-haiku',
    pinned: false,
    createdAt: iso(4 * 86_400_000),
    updatedAt: iso(2 * 3_600_000),
  },
];

export const SEED_MESSAGES: Record<string, Message[]> = {
  'conv-welcome': [
    {
      id: 'msg-w1',
      conversationId: 'conv-welcome',
      role: 'user',
      content: 'What is FriesianAI and how should I use it?',
      status: 'complete',
      createdAt: iso(2 * 86_400_000),
    },
    {
      id: 'msg-w2',
      conversationId: 'conv-welcome',
      role: 'assistant',
      modelId: 'anthropic/claude-sonnet',
      content: [
        '**FriesianAI** is your personal AI assistant — chat is the whole product, and a quiet workspace lives one click away.',
        '',
        'A few things to try:',
        '',
        '- **Just talk** — the model selector sits in the top bar; switch between OpenAI, Anthropic, Google, OpenRouter, and local models any time.',
        '- **Open the workspace** with the panel icon (or `⌘.`) for projects, files, notes, and memory — it stays out of the way until you ask.',
        '- Press `⌘K` to search everything, `⌘N` for a new chat.',
        '',
        'Here is a code block to show off syntax highlighting:',
        '',
        '```ts',
        'interface Project {',
        '  id: string;',
        '  name: string;',
        '  chats: Conversation[];',
        '}',
        '',
        'const focus = (p: Project) => `Working on ${p.name}`;',
        '```',
        '',
        '> Responses in this MVP are simulated locally — add API keys in Settings when you wire up real providers.',
      ].join('\n'),
      status: 'complete',
      createdAt: iso(2 * 86_400_000 - 60_000),
    },
  ],
  'conv-debounce': [
    {
      id: 'msg-d1',
      conversationId: 'conv-debounce',
      role: 'user',
      content: 'Show me a clean way to debounce a search input in React with TypeScript.',
      status: 'complete',
      createdAt: iso(86_400_000),
    },
    {
      id: 'msg-d2',
      conversationId: 'conv-debounce',
      role: 'assistant',
      modelId: 'anthropic/claude-sonnet',
      content: [
        'A small `useDebouncedValue` hook keeps components clean:',
        '',
        '```tsx',
        'import { useEffect, useState } from "react";',
        '',
        'export function useDebouncedValue<T>(value: T, delay = 300): T {',
        '  const [debounced, setDebounced] = useState(value);',
        '',
        '  useEffect(() => {',
        '    const timer = setTimeout(() => setDebounced(value), delay);',
        '    return () => clearTimeout(timer);',
        '  }, [value, delay]);',
        '',
        '  return debounced;',
        '}',
        '```',
        '',
        'Then in your component:',
        '',
        '```tsx',
        'const [query, setQuery] = useState("");',
        'const debouncedQuery = useDebouncedValue(query, 300);',
        '',
        'useEffect(() => {',
        '  if (debouncedQuery) search(debouncedQuery);',
        '}, [debouncedQuery]);',
        '```',
        '',
        'The input stays perfectly responsive while network calls only fire after the user pauses.',
      ].join('\n'),
      status: 'complete',
      createdAt: iso(86_400_000 - 90_000),
    },
  ],
  'conv-personal-1': [
    {
      id: 'msg-p1',
      conversationId: 'conv-personal-1',
      role: 'user',
      content: 'Give me a simple high-protein meal plan for the week.',
      status: 'complete',
      createdAt: iso(4 * 86_400_000),
    },
    {
      id: 'msg-p2',
      conversationId: 'conv-personal-1',
      role: 'assistant',
      modelId: 'anthropic/claude-haiku',
      content:
        'Here is a simple rotation: eggs and oats for breakfast; chicken, rice, and greens for lunch; salmon or lean beef with vegetables for dinner; Greek yogurt or cottage cheese as snacks. Prep proteins in batches on Sunday and vary sauces to keep it interesting.',
      status: 'complete',
      createdAt: iso(4 * 86_400_000 - 45_000),
    },
  ],
};

export const SEED_FILES: FileMeta[] = [
  {
    id: 'file-1',
    projectId: 'proj-coding',
    name: 'architecture-notes.md',
    kind: 'markdown',
    mimeType: 'text/markdown',
    size: 4210,
    createdAt: iso(5 * 86_400_000),
    indexed: false,
  },
  {
    id: 'file-2',
    projectId: 'proj-coding',
    name: 'api-spec.pdf',
    kind: 'pdf',
    mimeType: 'application/pdf',
    size: 182_400,
    createdAt: iso(3 * 86_400_000),
    indexed: false,
  },
  {
    id: 'file-3',
    projectId: 'proj-research',
    name: 'papers-to-read.txt',
    kind: 'text',
    mimeType: 'text/plain',
    size: 1330,
    createdAt: iso(6 * 86_400_000),
    indexed: false,
  },
];

export const SEED_NOTES: Note[] = [
  {
    id: 'note-1',
    projectId: 'proj-coding',
    title: 'MVP scope',
    content:
      'Workspace-first layout, project isolation, model abstraction, mock streaming. Next: real providers, semantic file search.',
    createdAt: iso(6 * 86_400_000),
    updatedAt: iso(2 * 86_400_000),
  },
  {
    id: 'note-2',
    projectId: 'proj-coding',
    title: 'Provider wiring',
    content:
      'Each provider implements streamChat() in services/ai/providers. Swap the simulated stream for a fetch to /api/chat when the backend is connected.',
    createdAt: iso(4 * 86_400_000),
    updatedAt: iso(86_400_000),
  },
];

export const SEED_MEMORIES: MemoryEntry[] = [
  {
    id: 'mem-1',
    content: 'Prefers concise answers with practical next steps.',
    projectId: null,
    createdAt: iso(12 * 86_400_000),
    updatedAt: iso(12 * 86_400_000),
  },
  {
    id: 'mem-2',
    content: 'Works in TypeScript; examples should default to TS.',
    projectId: null,
    createdAt: iso(9 * 86_400_000),
    updatedAt: iso(9 * 86_400_000),
  },
];

export const SEED_PROMPTS: PinnedPrompt[] = [
  {
    id: 'prompt-1',
    projectId: null,
    title: 'Explain like I am busy',
    prompt: 'Explain this in three short bullet points, then one practical next step.',
    createdAt: iso(10 * 86_400_000),
  },
  {
    id: 'prompt-2',
    projectId: 'proj-coding',
    title: 'Code review',
    prompt:
      'Review this code for correctness, readability, and edge cases. Suggest concrete improvements with short code examples.',
    createdAt: iso(8 * 86_400_000),
  },
];
