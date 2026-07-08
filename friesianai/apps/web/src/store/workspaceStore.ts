import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectColor, ProjectKind } from '@/types';
import { SEED_PROJECTS } from '@/constants/seed';
import { createId } from '@/utils/id';

interface CreateProjectInput {
  name: string;
  kind: ProjectKind;
  color: ProjectColor;
  description?: string;
}

interface WorkspaceState {
  projects: Project[];

  createProject: (input: CreateProjectInput) => Project;
  updateProject: (projectId: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (projectId: string) => void;
  touchProject: (projectId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      projects: SEED_PROJECTS,

      createProject: (input) => {
        const now = new Date().toISOString();
        const project: Project = {
          id: createId(),
          name: input.name.trim() || 'Untitled project',
          kind: input.kind,
          color: input.color,
          description: input.description?.trim() ?? '',
          instructions: '',
          createdAt: now,
          updatedAt: now,
          hasUnread: false,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return project;
      },

      updateProject: (projectId, patch) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      deleteProject: (projectId) =>
        set((state) => ({ projects: state.projects.filter((p) => p.id !== projectId) })),

      touchProject: (projectId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, updatedAt: new Date().toISOString() } : p,
          ),
        })),
    }),
    {
      name: 'friesian:workspace',
      version: 2,
      // v1 also persisted activeProjectId (the old always-visible project
      // switcher). Only the projects list carries forward.
      migrate: (persisted) => {
        const state = persisted as Partial<WorkspaceState> | undefined;
        return { projects: state?.projects ?? SEED_PROJECTS } as WorkspaceState;
      },
      partialize: (state) => ({ projects: state.projects }),
    },
  ),
);
