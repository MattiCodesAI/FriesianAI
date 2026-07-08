import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkspaceSection =
  | 'projects'
  | 'files'
  | 'notes'
  | 'knowledge'
  | 'memory'
  | 'tasks'
  | 'bookmarks'
  | 'integrations'
  | 'recent';

interface UiState {
  // Persisted layout preferences
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  workspaceWidth: number;
  workspaceSection: WorkspaceSection;

  // Ephemeral (not persisted)
  /** The workspace is hidden by default — chat is the product. */
  workspaceOpen: boolean;
  commandPaletteOpen: boolean;
  createProjectOpen: boolean;

  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  toggleWorkspace: () => void;
  setWorkspaceOpen: (open: boolean) => void;
  setWorkspaceWidth: (width: number) => void;
  setWorkspaceSection: (section: WorkspaceSection) => void;
  openWorkspaceAt: (section: WorkspaceSection) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCreateProjectOpen: (open: boolean) => void;
}

export const SIDEBAR_MIN = 208;
export const SIDEBAR_MAX = 340;
export const WORKSPACE_MIN = 320;
export const WORKSPACE_MAX = 560;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarWidth: 256,
      workspaceWidth: 400,
      workspaceSection: 'projects',

      workspaceOpen: false,
      commandPaletteOpen: false,
      createProjectOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarWidth: (width) =>
        set({ sidebarWidth: Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, width)) }),
      toggleWorkspace: () => set((s) => ({ workspaceOpen: !s.workspaceOpen })),
      setWorkspaceOpen: (workspaceOpen) => set({ workspaceOpen }),
      setWorkspaceWidth: (width) =>
        set({ workspaceWidth: Math.min(WORKSPACE_MAX, Math.max(WORKSPACE_MIN, width)) }),
      setWorkspaceSection: (workspaceSection) => set({ workspaceSection }),
      openWorkspaceAt: (workspaceSection) => set({ workspaceOpen: true, workspaceSection }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setCreateProjectOpen: (createProjectOpen) => set({ createProjectOpen }),
    }),
    {
      name: 'friesian:ui',
      version: 2,
      // v1 layout prefs are from the old three-panel layout; discard and use defaults.
      migrate: () => ({}) as UiState,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        workspaceWidth: state.workspaceWidth,
        workspaceSection: state.workspaceSection,
      }),
    },
  ),
);
