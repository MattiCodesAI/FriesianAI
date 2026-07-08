import { FolderOpen, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAllFiles, useRemoveFile } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { fileKindIcon } from '@/utils/files';
import { formatBytes, formatRelative } from '@/utils/time';

/** Every file across the workspace, newest first. */
export function FilesSection() {
  const { data: files, isLoading } = useAllFiles();
  const removeFile = useRemoveFile();
  const projects = useWorkspaceStore((s) => s.projects);

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen />}
        title="No files yet"
        description="Attach files in any chat, or add them inside a project."
      />
    );
  }

  const sorted = [...files].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ul className="space-y-px p-2">
      {sorted.map((file) => {
        const Icon = fileKindIcon(file.kind);
        const projectName = projects.find((p) => p.id === file.projectId)?.name;
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
              <p className="truncate text-[11px] text-faint">
                {projectName ? `${projectName} · ` : ''}
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
  );
}
