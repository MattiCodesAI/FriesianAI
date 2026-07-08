import { useMemo } from 'react';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Search,
  Settings,
  SquarePen,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { HorseLogo } from '@/components/ui/HorseLogo';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip } from '@/components/ui/Tooltip';
import { ConversationItem } from './ConversationItem';
import { keyLabel } from '@/constants/shortcuts';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { groupByDate } from '@/utils/time';

const COLLAPSED_WIDTH = 56;

/**
 * The sidebar stays deliberately small: identity, new chat, search,
 * conversation history, and the profile row. Nothing else.
 */
export function Sidebar() {
  const navigate = useNavigate();
  const conversationMatch = useMatch('/c/:conversationId');
  const activeConversationId = conversationMatch?.params.conversationId;

  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const width = useUiStore((s) => s.sidebarWidth);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);

  const conversations = useChatStore((s) => s.conversations);

  const { pinned, groups } = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return {
      pinned: sorted.filter((c) => c.pinned),
      groups: groupByDate(
        sorted.filter((c) => !c.pinned),
        (c) => c.updatedAt,
      ),
    };
  }, [conversations]);

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : width }}
      transition={{ type: 'spring', stiffness: 420, damping: 42 }}
      className="flex h-full shrink-0 flex-col overflow-hidden bg-surface-sunken"
    >
      {/* Identity */}
      <div className={cnHeader(collapsed)}>
        <Link
          to="/"
          aria-label="FriesianAI home"
          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-surface-hover"
        >
          <HorseLogo size={22} strokeWidth={2.6} />
        </Link>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight text-foreground">
              FriesianAI
            </span>
            <IconButton label="Collapse sidebar" size="sm" onClick={toggleSidebar}>
              <PanelLeftClose className="size-4" />
            </IconButton>
          </>
        )}
      </div>

      {collapsed ? (
        /* Collapsed rail */
        <div className="flex flex-1 flex-col items-center gap-1 px-2 py-1">
          <IconButton label="Expand sidebar" onClick={toggleSidebar}>
            <PanelLeftOpen className="size-4" />
          </IconButton>
          <IconButton label="New chat" onClick={() => navigate('/')}>
            <SquarePen className="size-4" />
          </IconButton>
          <IconButton label="Search" onClick={() => setCommandPaletteOpen(true)}>
            <Search className="size-4" />
          </IconButton>
          <div className="flex-1" />
          <IconButton label="Settings" onClick={() => navigate('/settings')}>
            <Settings className="size-4" />
          </IconButton>
          <Tooltip content="Matti" side="right">
            <button
              aria-label="Profile"
              className="mb-2 mt-1 cursor-pointer rounded-full focus-ring"
              onClick={() => navigate('/settings')}
            >
              <Avatar name="Matti" size="sm" />
            </button>
          </Tooltip>
        </div>
      ) : (
        <>
          {/* Primary actions */}
          <div className="space-y-0.5 px-2 pt-1">
            <button
              onClick={() => navigate('/')}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-hover cursor-pointer"
            >
              <SquarePen className="size-4 text-muted" />
              New chat
              <span className="ml-auto flex items-center gap-0.5">
                <Kbd>{keyLabel('mod')}</Kbd>
                <Kbd>N</Kbd>
              </span>
            </button>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
            >
              <Search className="size-4" />
              Search
              <span className="ml-auto flex items-center gap-0.5">
                <Kbd>{keyLabel('mod')}</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>
          </div>

          {/* History */}
          <nav className="mt-4 flex-1 overflow-y-auto px-2 pb-2" aria-label="Conversation history">
            {pinned.length > 0 && (
              <section className="mb-4">
                <h3 className="flex items-center gap-1.5 px-2.5 pb-1.5 text-[11px] font-medium text-faint">
                  <Pin className="size-3" /> Pinned
                </h3>
                <div className="space-y-px">
                  {pinned.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeConversationId}
                    />
                  ))}
                </div>
              </section>
            )}

            {groups.map(([label, items]) => (
              <section key={label} className="mb-4">
                <h3 className="px-2.5 pb-1.5 text-[11px] font-medium text-faint">{label}</h3>
                <div className="space-y-px">
                  {items.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeConversationId}
                    />
                  ))}
                </div>
              </section>
            ))}

            {pinned.length === 0 && groups.length === 0 && (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <Plus className="size-4 text-faint" />
                <p className="mt-2 text-xs leading-5 text-faint">
                  Your conversations will appear here.
                </p>
              </div>
            )}
          </nav>

          {/* Profile */}
          <div className="px-2 pb-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover cursor-pointer"
            >
              <Avatar name="Matti" size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">Matti</span>
                <span className="block text-[11px] text-faint">Personal</span>
              </span>
              <Settings className="size-4 text-faint" />
            </button>
          </div>
        </>
      )}
    </motion.aside>
  );
}

function cnHeader(collapsed: boolean): string {
  return collapsed
    ? 'flex h-13 shrink-0 items-center justify-center px-2'
    : 'flex h-13 shrink-0 items-center gap-2 px-3';
}
