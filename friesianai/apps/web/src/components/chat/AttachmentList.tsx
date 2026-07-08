import type { MessageAttachment } from '@/types';
import { getAttachmentPreview } from '@/services/attachments';
import { fileKindIcon } from '@/utils/files';
import { formatBytes } from '@/utils/time';
import { cn } from '@/utils/cn';

/** Attachment chips / image previews rendered inside a message. */
export function AttachmentList({
  attachments,
  align = 'start',
}: {
  attachments: MessageAttachment[];
  align?: 'start' | 'end';
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', align === 'end' && 'justify-end')}>
      {attachments.map((attachment) => {
        const preview = getAttachmentPreview(attachment.id);
        if (preview) {
          return (
            <img
              key={attachment.id}
              src={preview}
              alt={attachment.name}
              className="max-h-56 max-w-72 rounded-xl object-cover shadow-soft"
            />
          );
        }
        const Icon = fileKindIcon(attachment.kind);
        return (
          <span
            key={attachment.id}
            className="flex items-center gap-2 rounded-xl bg-surface-active/60 px-2.5 py-2"
          >
            <Icon className="size-4 text-muted" />
            <span>
              <span className="block max-w-48 truncate text-xs font-medium text-foreground">
                {attachment.name}
              </span>
              <span className="block text-[10px] text-faint">{formatBytes(attachment.size)}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
