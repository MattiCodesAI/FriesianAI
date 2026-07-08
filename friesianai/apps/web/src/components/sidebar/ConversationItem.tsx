import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import type { Conversation } from '@/types';
import { DropdownMenu, MenuItem, MenuSeparator } from '@/components/ui/DropdownMenu';
import { useChatStore } from '@/store/chatStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { cn } from '@/utils/cn';

interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
}

/** One row in the sidebar's conversation history. */
export const ConversationItem = memo(function ConversationItem({
  conversation,
  active,
}: ConversationItemProps) {
  const navigate = useNavigate();
  const renameConversation = useChatStore((s) => s.renameConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const togglePin = useChatStore((s) => s.togglePin);
  const projectName = useWorkspaceStore((s) =>
    conversation.projectId
      ? s.projects.find((p) => p.id === conversation.projectId)?.name
      : undefined,
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);

  const commitRename = () => {
    renameConversation(conversation.id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="px-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setDraft(conversation.title);
              setEditing(false);
            }
          }}
          className="h-7 w-full rounded-lg bg-surface-active px-2 text-[13px] text-foreground outline-none ring-1 ring-accent/50"
        />
      </div>
    );
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center rounded-lg transition-colors duration-100 cursor-pointer focus-ring',
        active ? 'bg-surface-active/80 text-foreground' : 'text-muted hover:bg-surface-hover hover:text-foreground',
      )}
      onClick={() => navigate(`/c/${conversation.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/c/${conversation.id}`);
      }}
    >
      <span className="min-w-0 flex-1 truncate px-2.5 py-1.5 text-[13px]">
        {conversation.title}
      </span>
      <span
        className="mr-1 hidden shrink-0 group-hover:inline-flex"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu
          align="end"
          trigger={() => (
            <span
              role="button"
              aria-label="Conversation options"
              className="inline-flex size-5 items-center justify-center rounded text-faint hover:text-foreground"
            >
              <MoreHorizontal className="size-3.5" />
            </span>
          )}
        >
          {projectName && (
            <>
              <MenuItem icon={<FolderOpen />} disabled>
                In {projectName}
              </MenuItem>
              <MenuSeparator />
            </>
          )}
          <MenuItem
            icon={conversation.pinned ? <PinOff /> : <Pin />}
            onSelect={() => togglePin(conversation.id)}
          >
            {conversation.pinned ? 'Unpin' : 'Pin'}
          </MenuItem>
          <MenuItem
            icon={<Pencil />}
            onSelect={() => {
              setDraft(conversation.title);
              setEditing(true);
            }}
          >
            Rename
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            danger
            icon={<Trash2 />}
            onSelect={() => {
              deleteConversation(conversation.id);
              if (active) navigate('/');
            }}
          >
            Delete
          </MenuItem>
        </DropdownMenu>
      </span>
    </div>
  );
});
