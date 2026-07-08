import { Navigate, useParams } from 'react-router-dom';
import { ChatView } from '@/components/chat/ChatView';
import { useChatStore } from '@/store/chatStore';

/** "/c/:conversationId" — renders the conversation or falls back home. */
export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const exists = useChatStore((s) =>
    Boolean(conversationId && s.conversations.some((c) => c.id === conversationId)),
  );

  if (!conversationId || !exists) return <Navigate to="/" replace />;
  return <ChatView conversationId={conversationId} />;
}
