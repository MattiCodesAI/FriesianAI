import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';
import { Toaster } from '@/components/ui/Toaster';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TopBar } from '@/components/topbar/TopBar';
import { CommandPalette } from '@/components/search/CommandPalette';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { ResizeHandle } from './ResizeHandle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import { useUiStore } from '@/store/uiStore';

// The workspace is secondary by design — its code loads only when opened.
const WorkspacePanel = lazy(() => import('@/components/workspace/WorkspacePanel'));

/**
 * Application shell: a small sidebar, a vast chat surface, and a workspace
 * that slides in from the right only when asked for.
 */
export function AppShell() {
  useTheme();
  useKeyboardShortcuts();

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const sidebarWidth = useUiStore((s) => s.sidebarWidth);
  const setSidebarWidth = useUiStore((s) => s.setSidebarWidth);
  const workspaceOpen = useUiStore((s) => s.workspaceOpen);
  const workspaceWidth = useUiStore((s) => s.workspaceWidth);
  const setWorkspaceWidth = useUiStore((s) => s.setWorkspaceWidth);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {!sidebarCollapsed && (
        <ResizeHandle
          value={sidebarWidth}
          onChange={setSidebarWidth}
          direction={1}
          ariaLabel="Resize sidebar"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col">
          <ErrorBoundary region="chat">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <AnimatePresence>
        {workspaceOpen && (
          <>
            <ResizeHandle
              value={workspaceWidth}
              onChange={setWorkspaceWidth}
              direction={-1}
              ariaLabel="Resize workspace"
            />
            <Suspense
              fallback={
                <div
                  style={{ width: workspaceWidth }}
                  className="flex h-full shrink-0 items-center justify-center bg-surface-sunken"
                >
                  <Spinner />
                </div>
              }
            >
              <WorkspacePanel />
            </Suspense>
          </>
        )}
      </AnimatePresence>

      {/* Global overlays */}
      <CommandPalette />
      <CreateProjectDialog />
      <Toaster />
    </div>
  );
}
