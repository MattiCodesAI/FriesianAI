import { useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Paperclip, Square, UploadCloud, X } from 'lucide-react';
import type { MessageAttachment } from '@/types';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getAttachmentPreview,
  registerAttachmentPreview,
  releaseAttachmentPreview,
} from '@/services/attachments';
import { fileKindFromMime, fileKindIcon } from '@/utils/files';
import { formatBytes } from '@/utils/time';
import { createId } from '@/utils/id';
import { CHAT_INPUT_ID } from '@/utils/focus';
import { keyLabel } from '@/constants/shortcuts';
import { cn } from '@/utils/cn';

interface ChatInputProps {
  onSend: (content: string, attachments: MessageAttachment[]) => void;
  streaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** "hero" renders the larger, home-screen variant. */
  variant?: 'chat' | 'hero';
}

/**
 * The chat input: multi-line and auto-growing, with drag-and-drop
 * attachments, image previews, send/stop, and settings-driven Enter behavior.
 */
export function ChatInput({
  onSend,
  streaming = false,
  onStop,
  placeholder = 'Message FriesianAI…',
  autoFocus = false,
  variant = 'chat',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const sendOnEnter = useSettingsStore((s) => s.sendOnEnter);
  const hero = variant === 'hero';

  useAutosizeTextarea(textareaRef, value, hero ? 200 : 240);

  const canSend = Boolean(value.trim() || attachments.length > 0);

  const submit = () => {
    if (!canSend || streaming) return;
    const content = value.trim();
    const pending = attachments;
    setValue('');
    setAttachments([]);
    onSend(content, pending);
  };

  const addFiles = (files: FileList | File[]) => {
    const next = Array.from(files).map((file) => {
      const attachment: MessageAttachment = {
        id: createId(),
        name: file.name,
        kind: fileKindFromMime(file.type, file.name),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      };
      registerAttachmentPreview(attachment.id, file);
      return attachment;
    });
    if (next.length > 0) setAttachments((prev) => [...prev, ...next]);
  };

  const removeAttachment = (id: string) => {
    releaseAttachmentPreview(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl bg-surface-raised transition-all duration-200',
        'border shadow-soft',
        dragging
          ? 'border-accent/60 ring-2 ring-accent/20'
          : 'border-border/70 focus-within:border-border-strong focus-within:shadow-raised',
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-2xl bg-accent-soft text-sm font-medium text-accent backdrop-blur-[1px]"
          >
            <UploadCloud className="size-4" /> Drop files to attach
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending attachments */}
      <AnimatePresence initial={false}>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 px-3.5 pt-3">
              {attachments.map((attachment) => {
                const preview = getAttachmentPreview(attachment.id);
                const Icon = fileKindIcon(attachment.kind);
                return (
                  <div
                    key={attachment.id}
                    className="group relative flex items-center gap-2 rounded-xl bg-surface-active/60 py-1.5 pl-1.5 pr-2.5"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt={attachment.name}
                        className="size-9 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex size-9 items-center justify-center rounded-lg bg-surface-active text-muted">
                        <Icon className="size-4" />
                      </span>
                    )}
                    <span className="max-w-40">
                      <span className="block truncate text-xs font-medium text-foreground">
                        {attachment.name}
                      </span>
                      <span className="block text-[10px] text-faint">
                        {formatBytes(attachment.size)}
                      </span>
                    </span>
                    <button
                      aria-label={`Remove ${attachment.name}`}
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -right-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full bg-surface-active text-muted opacity-0 shadow-soft transition-opacity hover:text-foreground group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <textarea
        id={CHAT_INPUT_ID}
        ref={textareaRef}
        value={value}
        autoFocus={autoFocus}
        rows={hero ? 2 : 1}
        maxLength={32_000}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          const mod = e.metaKey || e.ctrlKey;
          if ((sendOnEnter && !e.shiftKey && !mod) || (!sendOnEnter && mod)) {
            e.preventDefault();
            submit();
          }
        }}
        className={cn(
          'w-full resize-none bg-transparent text-foreground outline-none placeholder:text-faint',
          hero
            ? 'max-h-50 px-5 pb-1 pt-4.5 text-[15px] leading-7'
            : 'max-h-60 px-4 pb-1 pt-3.5 text-[15px] leading-6.5',
        )}
      />

      <div className={cn('flex items-center gap-1 pb-2.5', hero ? 'px-3.5' : 'px-2.5')}>
        <IconButton label="Attach files" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Paperclip className="size-4" />
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.markdown,image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <span className="flex-1" />

        <span className="mr-2 hidden items-center gap-1 text-[10px] text-faint sm:flex">
          {sendOnEnter ? (
            <>
              <Kbd>enter</Kbd> to send
            </>
          ) : (
            <>
              <Kbd>{keyLabel('mod')}</Kbd>
              <Kbd>enter</Kbd> to send
            </>
          )}
        </span>

        {streaming ? (
          <button
            onClick={onStop}
            aria-label="Stop generating"
            className="flex h-8 items-center gap-1.5 rounded-xl bg-surface-active px-3 text-xs font-medium text-foreground transition-colors hover:bg-danger-soft hover:text-danger cursor-pointer"
          >
            <Square className="size-3 fill-current" /> Stop
          </button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'flex items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer',
              hero ? 'size-9' : 'size-8',
              canSend
                ? 'bg-accent text-on-accent hover:bg-accent-hover'
                : 'bg-surface-active text-faint',
            )}
          >
            <ArrowUp className={hero ? 'size-4.5' : 'size-4'} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
