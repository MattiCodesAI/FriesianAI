import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, FolderPlus, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, MenuItem } from '@/components/ui/DropdownMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Tabs } from '@/components/ui/Tabs';
import { ContextTab } from '@/components/panels/ContextTab';
import { FilesTab } from '@/components/panels/FilesTab';
import { NotesTab } from '@/components/panels/NotesTab';
import { PROJECT_COLORS, projectIcon, projectKindLabel } from '@/constants/projects';
import { purgeProjectData } from '@/services/repositories';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { formatRelative } from '@/utils/time';

type DetailTab = 'chats' | 'files' | 'notes' | 'about';

/** Projects: list → detail, with a project's chats, files, notes, and settings. */
export function ProjectsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const projects = useWorkspaceStore((s) => s.projects);
  const setCreateProjectOpen = useUiStore((s) => s.setCreateProjectOpen);

  const selected = projects.find((p) => p.id === selectedId);

  if (selected) {
    return <ProjectDetail projectId={selected.id} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCreateProjectOpen(true)}
        >
          <Plus className="size-3.5" /> New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderPlus />}
          title="No projects yet"
          description="Projects group chats, files, notes, and memory around one area of your life."
        />
      ) : (
        <ul className="flex-1 space-y-px overflow-y-auto px-2 pb-2">
          {projects.map((project) => {
            const Icon = projectIcon(project.kind);
            const palette = PROJECT_COLORS[project.color];
            return (
              <li key={project.id}>
                <button
                  onClick={() => setSelectedId(project.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover cursor-pointer"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: palette.soft }}
                  >
                    <Icon className="size-4" style={{ color: palette.dot }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-foreground">
                      {project.name}
                    </span>
                    <span className="block text-[11px] text-faint">
                      {projectKindLabel(project.kind)} · {formatRelative(project.updatedAt)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-faint" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<DetailTab>('chats');

  const project = useWorkspaceStore((s) => s.projects.find((p) => p.id === projectId));
  const deleteProject = useWorkspaceStore((s) => s.deleteProject);
  const conversations = useChatStore((s) => s.conversations);
  const createConversation = useChatStore((s) => s.createConversation);
  const detachProjectConversations = useChatStore((s) => s.detachProjectConversations);

  const handleDelete = () => {
    // Chats survive as top-level conversations; workspace data goes with the project.
    detachProjectConversations(projectId);
    deleteProject(projectId);
    void purgeProjectData(projectId).then(() => queryClient.invalidateQueries());
    onBack();
  };

  const projectChats = useMemo(
    () =>
      conversations
        .filter((c) => c.projectId === projectId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [conversations, projectId],
  );

  if (!project) return null;

  const Icon = projectIcon(project.kind);
  const palette = PROJECT_COLORS[project.color];

  return (
    <div className="flex h-full flex-col">
      {/* Detail header */}
      <div className="flex shrink-0 items-center gap-2 px-2 pt-2">
        <IconButton label="All projects" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </IconButton>
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: palette.soft }}
        >
          <Icon className="size-3.5" style={{ color: palette.dot }} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {project.name}
        </span>
        <DropdownMenu
          align="end"
          trigger={() => (
            <IconButton label="Project options" size="sm" hideTooltip>
              <MoreHorizontal className="size-4" />
            </IconButton>
          )}
        >
          <MenuItem danger icon={<Trash2 />} onSelect={handleDelete}>
            Delete project
          </MenuItem>
        </DropdownMenu>
      </div>

      <Tabs
        className="mx-2 mt-2 shrink-0"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'chats', label: 'Chats' },
          { id: 'files', label: 'Files' },
          { id: 'notes', label: 'Notes' },
          { id: 'about', label: 'About' },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'chats' && (
          <div className="flex h-full flex-col">
            <div className="shrink-0 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const conversation = createConversation(project.id);
                  navigate(`/c/${conversation.id}`);
                }}
              >
                <Plus className="size-3.5" /> New chat in {project.name}
              </Button>
            </div>
            {projectChats.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs leading-5 text-faint">
                Chats started here stay scoped to this project's context.
              </p>
            ) : (
              <ul className="space-y-px px-2 pb-2">
                {projectChats.map((chat) => (
                  <li key={chat.id}>
                    <button
                      onClick={() => navigate(`/c/${chat.id}`)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-hover cursor-pointer"
                    >
                      <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                        {chat.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-faint">
                        {formatRelative(chat.updatedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === 'files' && <FilesTab projectId={project.id} />}
        {tab === 'notes' && <NotesTab projectId={project.id} />}
        {tab === 'about' && <ContextTab projectId={project.id} />}
      </div>
    </div>
  );
}
