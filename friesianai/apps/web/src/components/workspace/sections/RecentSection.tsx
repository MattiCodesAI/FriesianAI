import { useMemo } from 'react';
import { Clock, NotebookPen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAllFiles, useAllNotes } from '@/hooks/queries';
import { fileKindIcon } from '@/utils/files';
import { formatRelative } from '@/utils/time';
import type { LucideIcon } from 'lucide-react';

interface RecentItem {
  id: string;
  title: string;
  icon: LucideIcon;
  timestamp: string;
}

/** Recently touched documents — files and notes, merged by recency. */
export function RecentSection() {
  const { data: files, isLoading: filesLoading } = useAllFiles();
  const { data: notes, isLoading: notesLoading } = useAllNotes();

  const items = useMemo<RecentItem[]>(() => {
    const fromFiles: RecentItem[] = (files ?? []).map((f) => ({
      id: `file-${f.id}`,
      title: f.name,
      icon: fileKindIcon(f.kind),
      timestamp: f.createdAt,
    }));
    const fromNotes: RecentItem[] = (notes ?? []).map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      icon: NotebookPen,
      timestamp: n.updatedAt,
    }));
    return [...fromFiles, ...fromNotes]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 30);
  }, [files, notes]);

  if (filesLoading || notesLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Clock />}
        title="Nothing recent"
        description="Documents you touch will gather here for quick access."
      />
    );
  }

  return (
    <ul className="space-y-px p-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface-hover">
          <item.icon className="size-4 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{item.title}</span>
          <span className="shrink-0 text-[10px] text-faint">{formatRelative(item.timestamp)}</span>
        </li>
      ))}
    </ul>
  );
}
