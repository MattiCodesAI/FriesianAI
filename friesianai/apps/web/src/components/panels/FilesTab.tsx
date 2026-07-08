import { useRef } from 'react';
import { FolderOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAddFile, useProjectFiles, useRemoveFile } from '@/hooks/queries';
import { fileKindFromMime, fileKindIcon } from '@/utils/files';
import { formatBytes, formatRelative } from '@/utils/time';

/** Files that belong to one project. Future: semantic search over content. */
export function FilesTab({ projectId }: { projectId: string }) {
  const { data: files, isLoading } = useProjectFiles(projectId);
  const addFile = useAddFile();
  const removeFile = useRemoveFile();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (list: FileList | null) => {
    if (!list) return;
    for (const file of Array.from(list)) {
      addFile.mutate({
        projectId,
        name: file.name,
        kind: fileKindFromMime(file.type, file.name),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-2">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => inputRef.current?.click()}>
          <Plus className="size-3.5" /> Add files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.markdown,image/*"
          className="hidden"
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {!files || files.length === 0 ? (
        <EmptyState
          icon={<FolderOpen />}
          title="No files yet"
          description="Add PDFs, notes, or images — or attach them in any chat in this project."
        />
      ) : (
        <ul className="flex-1 space-y-px overflow-y-auto px-2 pb-2">
          {files.map((file) => {
            const Icon = fileKindIcon(file.kind);
            return (
              <li
                key={file.id}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-active/70 text-muted">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{file.name}</p>
                  <p className="text-[11px] text-faint">
                    {formatBytes(file.size)} · {formatRelative(file.createdAt)}
                  </p>
                </div>
                <IconButton
                  label="Remove file"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => removeFile.mutate(file.id)}
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
