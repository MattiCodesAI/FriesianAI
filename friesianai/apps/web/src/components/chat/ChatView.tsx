import type { MessageAttachment } from '@/types';
import { HorseLogo } from '@/components/ui/HorseLogo';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { NO_MESSAGES, useChatStore } from '@/store/chatStore';
import { useAddFile } from '@/hooks/queries';

interface ChatViewProps {
  conversationId: string;
}

/** A single conversation: messages + input. */
export function ChatView({ conversationId }: ChatViewProps) {
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === conversationId));
  const messages = useChatStore((s) => s.messagesByConversation[conversationId] ?? NO_MESSAGES);
  const streaming = useChatStore((s) => s.streamingConversationId === conversationId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopGeneration = useChatStore((s) => s.stopGeneration);
  const addFile = useAddFile();

  if (!conversation) return null;

  const handleSend = (content: string, attachments: MessageAttachment[]) => {
    void sendMessage(conversationId, content, attachments);
    // Attachments sent inside a project chat also join the project's files.
    if (conversation.projectId) {
      for (const attachment of attachments) {
        addFile.mutate({
          projectId: conversation.projectId,
          name: attachment.name,
          kind: attachment.kind,
          mimeType: attachment.mimeType,
          size: attachment.size,
        });
      }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <HorseLogo size={44} strokeWidth={2} className="text-faint" />
          <p className="mt-4 text-sm text-muted">
            A quiet space — say anything to begin.
          </p>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      <div className="shrink-0 px-6 pb-5 pt-2">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput
            autoFocus
            streaming={streaming}
            onSend={handleSend}
            onStop={() => stopGeneration(conversationId)}
          />
        </div>
      </div>
    </div>
  );
}
