import { NotebookPen, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { useAllNotes, useRemoveNote, useUpdateNote } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { formatRelative } from '@/utils/time';

/** Every note across the workspace. New notes are created inside a project. */
export function NotesSection() {
  const { data: notes, isLoading } = useAllNotes();
  const updateNote = useUpdateNote();
  const removeNote = useRemoveNote();
  const projects = useWorkspaceStore((s) => s.projects);

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <EmptyState
        icon={<NotebookPen />}
        title="No notes yet"
        description="Open a project to capture decisions, context, and ideas."
      />
    );
  }

  const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <ul className="space-y-2 p-2">
      {sorted.map((note) => {
        const projectName = projects.find((p) => p.id === note.projectId)?.name;
        return (
          <li key={note.id} className="group rounded-xl bg-surface-raised/60 p-2.5">
            <div className="flex items-center gap-2">
              <h4 className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                {note.title}
              </h4>
              <span className="shrink-0 text-[10px] text-faint">
                {projectName ? `${projectName} · ` : ''}
                {formatRelative(note.updatedAt)}
              </span>
              <IconButton
                label="Delete note"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => removeNote.mutate(note.id)}
              >
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
            <Textarea
              defaultValue={note.content}
              placeholder="Write something…"
              rows={2}
              className="mt-1.5 border-transparent bg-transparent px-0 py-0 text-xs leading-5 text-muted hover:border-transparent focus:border-transparent focus:ring-0"
              onBlur={(e) => {
                if (e.target.value !== note.content) {
                  updateNote.mutate({ id: note.id, content: e.target.value });
                }
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
