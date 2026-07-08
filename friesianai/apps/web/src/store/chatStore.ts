import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, Message, MessageAttachment } from '@/types';
import { SEED_CONVERSATIONS, SEED_MESSAGES } from '@/constants/seed';
import { streamChat, toChatTurns } from '@/services/ai/chatService';
import { assembleSystemPrompt } from '@/services/orchestration/contextAssembly';
import { useWorkspaceStore } from './workspaceStore';
import { useSettingsStore } from './settingsStore';
import { toast } from './toastStore';
import { createId } from '@/utils/id';
import { deriveTitle } from '@/utils/text';

/** Abort controllers are ephemeral by nature — kept outside persisted state. */
const abortControllers = new Map<string, AbortController>();

/**
 * Stable empty array so selectors never return a fresh `[]` reference —
 * a new reference per snapshot causes React's useSyncExternalStore to
 * re-render in a loop ("Maximum update depth exceeded").
 */
export const NO_MESSAGES: readonly Message[] = Object.freeze([]);

interface ChatState {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  /** Conversation currently receiving a streamed response, if any. */
  streamingConversationId: string | null;

  createConversation: (projectId?: string | null, modelId?: string) => Conversation;
  deleteConversation: (conversationId: string) => void;
  /** Turn a deleted project's chats into top-level chats instead of losing them. */
  detachProjectConversations: (projectId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  togglePin: (conversationId: string) => void;
  setConversationModel: (conversationId: string, modelId: string) => void;

  sendMessage: (
    conversationId: string,
    content: string,
    attachments?: MessageAttachment[],
  ) => Promise<void>;
  regenerateLast: (conversationId: string) => Promise<void>;
  editUserMessage: (conversationId: string, messageId: string, content: string) => Promise<void>;
  stopGeneration: (conversationId: string) => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      /** Immutably patch one message in one conversation. */
      const patchMessage = (
        conversationId: string,
        messageId: string,
        patch: Partial<Message>,
      ) =>
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((m) =>
              m.id === messageId ? { ...m, ...patch } : m,
            ),
          },
        }));

      const touchConversation = (conversationId: string) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, updatedAt: nowIso() } : c,
          ),
        }));

      /** Core streaming loop shared by send / regenerate / edit. */
      const runAssistantTurn = async (conversationId: string) => {
        const conversation = get().conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const systemPrompt = await assembleSystemPrompt(conversation);
        const history = toChatTurns(get().messagesByConversation[conversationId] ?? []);

        const assistantMessage: Message = {
          id: createId(),
          conversationId,
          role: 'assistant',
          content: '',
          status: 'streaming',
          modelId: conversation.modelId,
          createdAt: nowIso(),
        };

        set((state) => ({
          streamingConversationId: conversationId,
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: [
              ...(state.messagesByConversation[conversationId] ?? []),
              assistantMessage,
            ],
          },
        }));

        const controller = new AbortController();
        abortControllers.set(conversationId, controller);

        let buffer = '';
        try {
          const stream = streamChat({
            modelId: conversation.modelId,
            messages: history,
            systemPrompt,
            signal: controller.signal,
          });

          for await (const chunk of stream) {
            if (chunk.type === 'delta') {
              buffer += chunk.text;
              patchMessage(conversationId, assistantMessage.id, { content: buffer });
            } else if (chunk.type === 'error') {
              patchMessage(conversationId, assistantMessage.id, {
                status: 'error',
                content: buffer || `Something went wrong: ${chunk.message}`,
              });
              toast.error('Generation failed', chunk.message);
              return;
            }
          }

          patchMessage(conversationId, assistantMessage.id, {
            status: controller.signal.aborted ? 'stopped' : 'complete',
          });
        } finally {
          abortControllers.delete(conversationId);
          set((state) =>
            state.streamingConversationId === conversationId
              ? { streamingConversationId: null }
              : state,
          );
          touchConversation(conversationId);
          if (conversation.projectId) {
            useWorkspaceStore.getState().touchProject(conversation.projectId);
          }
        }
      };

      return {
        conversations: SEED_CONVERSATIONS,
        messagesByConversation: SEED_MESSAGES,
        streamingConversationId: null,

        createConversation: (projectId = null, modelId) => {
          const project = projectId
            ? useWorkspaceStore.getState().projects.find((p) => p.id === projectId)
            : undefined;
          const conversation: Conversation = {
            id: createId(),
            projectId,
            title: 'New chat',
            modelId:
              modelId ??
              project?.defaultModelId ??
              useSettingsStore.getState().defaultModelId,
            pinned: false,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          set((state) => ({
            conversations: [conversation, ...state.conversations],
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversation.id]: [],
            },
          }));
          return conversation;
        },

        deleteConversation: (conversationId) => {
          get().stopGeneration(conversationId);
          set((state) => {
            const { [conversationId]: _removed, ...rest } = state.messagesByConversation;
            return {
              conversations: state.conversations.filter((c) => c.id !== conversationId),
              messagesByConversation: rest,
            };
          });
        },

        detachProjectConversations: (projectId) =>
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.projectId === projectId ? { ...c, projectId: null } : c,
            ),
          })),

        renameConversation: (conversationId, title) =>
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, title: title.trim() || c.title, updatedAt: nowIso() }
                : c,
            ),
          })),

        togglePin: (conversationId) =>
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? { ...c, pinned: !c.pinned } : c,
            ),
          })),

        setConversationModel: (conversationId, modelId) =>
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? { ...c, modelId } : c,
            ),
          })),

        sendMessage: async (conversationId, content, attachments) => {
          const trimmed = content.trim();
          if ((!trimmed && !attachments?.length) || get().streamingConversationId) return;

          const conversation = get().conversations.find((c) => c.id === conversationId);
          if (!conversation) return;

          const userMessage: Message = {
            id: createId(),
            conversationId,
            role: 'user',
            content: trimmed,
            status: 'complete',
            attachments: attachments?.length ? attachments : undefined,
            createdAt: nowIso(),
          };

          const isFirstMessage =
            (get().messagesByConversation[conversationId] ?? []).length === 0;

          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: [
                ...(state.messagesByConversation[conversationId] ?? []),
                userMessage,
              ],
            },
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    title: isFirstMessage
                      ? deriveTitle(trimmed || attachments?.[0]?.name || 'New chat')
                      : c.title,
                    updatedAt: nowIso(),
                  }
                : c,
            ),
          }));

          await runAssistantTurn(conversationId);
        },

        regenerateLast: async (conversationId) => {
          if (get().streamingConversationId) return;
          const messages = get().messagesByConversation[conversationId] ?? [];
          const lastAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');
          if (lastAssistantIndex === -1) return;

          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages.slice(0, lastAssistantIndex),
            },
          }));

          await runAssistantTurn(conversationId);
        },

        editUserMessage: async (conversationId, messageId, content) => {
          if (get().streamingConversationId) return;
          const trimmed = content.trim();
          if (!trimmed) return;

          const messages = get().messagesByConversation[conversationId] ?? [];
          const index = messages.findIndex((m) => m.id === messageId);
          if (index === -1 || messages[index]?.role !== 'user') return;

          // Replace the edited message and drop everything after it,
          // then regenerate the assistant response.
          const updated = [
            ...messages.slice(0, index),
            { ...messages[index], content: trimmed, createdAt: nowIso() },
          ];

          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: updated,
            },
          }));

          await runAssistantTurn(conversationId);
        },

        stopGeneration: (conversationId) => {
          abortControllers.get(conversationId)?.abort();
        },
      };
    },
    {
      name: 'friesian:chats',
      version: 2,
      migrate: (persisted: unknown) => {
        // v1 → v2: Conversation.projectId became nullable; shapes are otherwise
        // compatible, so the persisted state passes through unchanged.
        return persisted as Pick<ChatState, 'conversations' | 'messagesByConversation'>;
      },
      partialize: (state) => ({
        conversations: state.conversations,
        messagesByConversation: state.messagesByConversation,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // If the app closed mid-stream, finalize any dangling messages.
        const fixed: Record<string, Message[]> = {};
        for (const [convId, messages] of Object.entries(state.messagesByConversation)) {
          fixed[convId] = messages.map((m) =>
            m.status === 'streaming' ? { ...m, status: 'stopped' as const } : m,
          );
        }
        state.messagesByConversation = fixed;
      },
    },
  ),
);
