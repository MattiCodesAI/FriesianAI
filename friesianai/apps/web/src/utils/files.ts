import { FileText, FileType2, Image as ImageIcon, File as FileIcon, type LucideIcon } from 'lucide-react';
import type { FileKind } from '@/types';

/** Map a browser File's mime type / extension onto our FileKind. */
export function fileKindFromMime(mimeType: string, name: string): FileKind {
  const lower = name.toLowerCase();
  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
  if (mimeType.startsWith('text/') || lower.endsWith('.txt')) return 'text';
  return 'other';
}

export function fileKindIcon(kind: FileKind): LucideIcon {
  switch (kind) {
    case 'pdf':
      return FileType2;
    case 'image':
      return ImageIcon;
    case 'markdown':
    case 'text':
      return FileText;
    default:
      return FileIcon;
  }
}
