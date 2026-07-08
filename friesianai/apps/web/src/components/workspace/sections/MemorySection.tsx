import { useState } from 'react';
import { BrainCircuit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateMemory, useMemories, useRemoveMemory, useUpdateMemory } from '@/hooks/queries';

/**
 * Long-term memory (Layer 4): user-curated today, model-curated later.
 * Every entry is injected into the system context of every chat.
 */
export function MemorySection() {
  const { data: memories, isLoading } = useMemories();
  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const removeMemory = useRemoveMemory();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const handleCreate = () => {
    const content = draft.trim();
    if (!content) return;
    createMemory.mutate({ content });
    setDraft('');
    setAdding(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <p className="shrink-0 px-4 pt-3 text-[11px] leading-4 text-faint">
        FriesianAI carries these into every conversation. Edit or remove them any time.
      </p>
      <div className="shrink-0 p-2">
        {adding ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              placeholder="e.g. I'm preparing for the SAT in March…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
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
            <Plus className="size-3.5" /> New memory
          </Button>
        )}
      </div>

      {!memories || memories.length === 0 ? (
        <EmptyState
          icon={<BrainCircuit />}
          title="Nothing remembered yet"
          description="Add the things FriesianAI should always know about you."
        />
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto p-2 pt-0">
          {memories.map((memory) => (
            <li key={memory.id} className="group flex items-start gap-1 rounded-xl bg-surface-raised/60 p-2.5">
              <Textarea
                defaultValue={memory.content}
                rows={2}
                className="flex-1 border-transparent bg-transparent px-0 py-0 text-xs leading-5 text-foreground hover:border-transparent focus:border-transparent focus:ring-0"
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next && next !== memory.content) {
                    updateMemory.mutate({ id: memory.id, content: next });
                  }
                }}
              />
              <IconButton
                label="Forget"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => removeMemory.mutate(memory.id)}
              >
                <Trash2 className="size-3.5" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
