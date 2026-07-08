import { useState } from 'react';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateNote, useProjectNotes, useRemoveNote, useUpdateNote } from '@/hooks/queries';
import { formatRelative } from '@/utils/time';

/** Lightweight project notes. Future: rich editor + AI memory extraction. */
export function NotesTab({ projectId }: { projectId: string }) {
  const { data: notes, isLoading } = useProjectNotes(projectId);
  const createNote = useCreateNote(projectId);
  const updateNote = useUpdateNote();
  const removeNote = useRemoveNote();

  const [draftTitle, setDraftTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleCreate = () => {
    const title = draftTitle.trim();
    if (!title) return;
    createNote.mutate({ title });
    setDraftTitle('');
    setAdding(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-2">
        {adding ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              placeholder="Note title…"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setAdding(false);
              }}
            />
            <Button size="sm" variant="primary" onClick={handleCreate}>
              Add
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> New note
          </Button>
        )}
      </div>

      {!notes || notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen />}
          title="No notes yet"
          description="Capture decisions, context, and ideas that should stay with this project."
        />
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto p-2 pt-0">
          {notes.map((note) => (
            <li key={note.id} className="group rounded-lg border border-border bg-surface p-2.5">
              <div className="flex items-center gap-2">
                <h4 className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {note.title}
                </h4>
                <span className="text-[10px] text-faint">{formatRelative(note.updatedAt)}</span>
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
                rows={3}
                className="mt-2 border-transparent bg-transparent px-0 py-0 text-xs leading-5 text-muted hover:border-transparent focus:border-transparent focus:ring-0"
                onBlur={(e) => {
                  if (e.target.value !== note.content) {
                    updateNote.mutate({ id: note.id, content: e.target.value });
                  }
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
