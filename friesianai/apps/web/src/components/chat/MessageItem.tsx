import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Pencil, RefreshCw, X } from 'lucide-react';
import type { Message } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HorseLogo } from '@/components/ui/HorseLogo';
import { IconButton } from '@/components/ui/IconButton';
import { Textarea } from '@/components/ui/Textarea';
import { AttachmentList } from './AttachmentList';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';
import { getModel } from '@/constants/models';
import { useChatStore } from '@/store/chatStore';
import { formatTime } from '@/utils/time';
import { cn } from '@/utils/cn';

interface MessageItemProps {
  message: Message;
  /** Whether this is the newest assistant message (enables Regenerate). */
  isLastAssistant: boolean;
}

/**
 * One conversation turn. Assistant turns render as plain, luxurious text
 * beside the mark; user turns sit in a soft right-aligned container.
 * Memoized — only the streaming message actually changes content.
 */
export const MessageItem = memo(function MessageItem({
  message,
  isLastAssistant,
}: MessageItemProps) {
  const regenerateLast = useChatStore((s) => s.regenerateLast);
  const editUserMessage = useChatStore((s) => s.editUserMessage);
  const streaming = useChatStore((s) => s.streamingConversationId === message.conversationId);

  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const isUser = message.role === 'user';
  const model = message.modelId ? getModel(message.modelId) : undefined;
  const isThinking = message.status === 'streaming' && message.content.length === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  const saveEdit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== message.content) {
      void editUserMessage(message.conversationId, message.id, draft);
    }
  };

  const actions = (
    <div
      className={cn(
        'flex h-7 items-center gap-1 text-[11px] text-faint',
        'opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
        isUser && 'justify-end',
      )}
    >
      <span className="px-1">{formatTime(message.createdAt)}</span>
      {model && !isUser && <span className="px-1 text-faint">{model.label}</span>}
      {message.status === 'stopped' && <Badge variant="warning">stopped</Badge>}
      {message.status === 'error' && <Badge variant="danger">error</Badge>}

      <IconButton label={copied ? 'Copied' : 'Copy message'} size="sm" onClick={copy}>
        {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      </IconButton>

      {isUser && !streaming && (
        <IconButton
          label="Edit message"
          size="sm"
          onClick={() => {
            setDraft(message.content);
            setEditing(true);
          }}
        >
          <Pencil className="size-3" />
        </IconButton>
      )}

      {!isUser && isLastAssistant && !streaming && (
        <IconButton
          label="Regenerate response"
          size="sm"
          onClick={() => void regenerateLast(message.conversationId)}
        >
          <RefreshCw className="size-3" />
        </IconButton>
      )}
    </div>
  );

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="msg-row group flex flex-col items-end gap-2"
      >
        {message.attachments && message.attachments.length > 0 && (
          <AttachmentList attachments={message.attachments} align="end" />
        )}
        {editing ? (
          <div className="w-full max-w-xl">
            <Textarea
              autoFocus
              value={draft}
              rows={3}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="size-3.5" /> Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={saveEdit}>
                <Check className="size-3.5" /> Save & resend
              </Button>
            </div>
          </div>
        ) : (
          message.content && (
            <div className="max-w-[75%] rounded-3xl rounded-br-lg bg-surface-active/70 px-4.5 py-2.5">
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                {message.content}
              </p>
            </div>
          )
        )}
        {actions}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="msg-row group flex gap-3.5"
    >
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <HorseLogo size={17} strokeWidth={3.2} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {isThinking ? (
          <TypingIndicator />
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
        {actions}
      </div>
    </motion.div>
  );
});
