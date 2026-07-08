import type { ComponentType } from 'react';
import {
  Bookmark,
  BrainCircuit,
  Clock,
  FolderKanban,
  Folders,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react';
import type { WorkspaceSection } from '@/store/uiStore';
import { BookmarksSection } from './BookmarksSection';
import { FilesSection } from './FilesSection';
import { MemorySection } from './MemorySection';
import { NotesSection } from './NotesSection';
import { ProjectsSection } from './ProjectsSection';
import { RecentSection } from './RecentSection';

export interface WorkspaceSectionDef {
  id: WorkspaceSection;
  label: string;
  icon: LucideIcon;
  component: ComponentType;
}

/**
 * Workspace section registry — the extension point for Layer 1 surfaces.
 *
 * Knowledge, Tasks, Integrations (and anything else from the FriesianAI
 * architecture) ship by adding one entry here plus a section component;
 * the panel rail, routing, and command palette pick them up automatically.
 * Unfinished systems are intentionally NOT registered as placeholder UI.
 */
export const WORKSPACE_SECTIONS: WorkspaceSectionDef[] = [
  { id: 'projects', label: 'Projects', icon: FolderKanban, component: ProjectsSection },
  { id: 'files', label: 'Files', icon: Folders, component: FilesSection },
  { id: 'notes', label: 'Notes', icon: NotebookPen, component: NotesSection },
  { id: 'memory', label: 'Memory', icon: BrainCircuit, component: MemorySection },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, component: BookmarksSection },
  { id: 'recent', label: 'Recent', icon: Clock, component: RecentSection },
];
