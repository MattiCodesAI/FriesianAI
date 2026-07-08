/**
 * Session-scoped attachment previews.
 *
 * Message attachments persist as metadata only; the binary lives in the
 * browser for the current session so images can render inline previews.
 * When file storage lands on the server, `getAttachmentPreview` swaps to a
 * storage URL and nothing else changes.
 */

const previews = new Map<string, string>();

export function registerAttachmentPreview(id: string, file: File): void {
  if (file.type.startsWith('image/')) {
    previews.set(id, URL.createObjectURL(file));
  }
}

export function getAttachmentPreview(id: string): string | undefined {
  return previews.get(id);
}

export function releaseAttachmentPreview(id: string): void {
  const url = previews.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    previews.delete(id);
  }
}
