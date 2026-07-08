import { Bookmark, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAllPrompts } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { setChatInputValue } from '@/utils/focus';

/** Bookmarked prompts — one click drops them into the chat input. */
export function BookmarksSection() {
  const { data: prompts, isLoading } = useAllPrompts();
  const projects = useWorkspaceStore((s) => s.projects);

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="No bookmarks yet"
        description="Save the prompts you reuse most and insert them with one click."
      />
    );
  }

  return (
    <ul className="space-y-2 p-2">
      {prompts.map((prompt) => {
        const projectName = prompt.projectId
          ? projects.find((p) => p.id === prompt.projectId)?.name
          : undefined;
        return (
          <li key={prompt.id}>
            <Tooltip content="Click to insert into chat" side="bottom">
              <button
                onClick={() => setChatInputValue(prompt.prompt)}
                className="w-full rounded-xl bg-surface-raised/60 p-2.5 text-left transition-colors hover:bg-surface-hover cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                    {prompt.title}
                  </span>
                  {prompt.projectId === null ? (
                    <Badge variant="outline">
                      <Globe className="size-2.5" /> global
                    </Badge>
                  ) : (
                    projectName && <Badge variant="outline">{projectName}</Badge>
                  )}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted line-clamp-2">
                  {prompt.prompt}
                </span>
              </button>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
