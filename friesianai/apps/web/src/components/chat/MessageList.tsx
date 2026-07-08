import { useMemo, useRef } from 'react';
import type { Message } from '@/types';
import { MessageItem } from './MessageItem';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface MessageListProps {
  messages: readonly Message[];
}

/**
 * Scrollable conversation area. Long histories stay fast via CSS
 * content-visibility on each row (off-screen turns skip layout/paint),
 * and streaming keeps the view pinned unless the reader scrolls up.
 */
export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track content growth (streaming) as well as new messages.
  const scrollKey = useMemo(
    () => `${messages.length}:${messages[messages.length - 1]?.content.length ?? 0}`,
    [messages],
  );
  useAutoScroll(scrollRef, scrollKey);

  const lastAssistantId = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant')?.id,
    [messages],
  );

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-6 pb-8 pt-8">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isLastAssistant={message.id === lastAssistantId}
          />
        ))}
      </div>
    </div>
  );
}
