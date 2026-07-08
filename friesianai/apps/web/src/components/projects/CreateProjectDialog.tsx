import { useState } from 'react';
import type { ProjectColor, ProjectKind } from '@/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { PROJECT_COLORS, PROJECT_COLOR_KEYS, PROJECT_KINDS } from '@/constants/projects';
import { useUiStore } from '@/store/uiStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { toast } from '@/store/toastStore';
import { cn } from '@/utils/cn';

/** New-project dialog (⌘⇧P). */
export function CreateProjectDialog() {
  const open = useUiStore((s) => s.createProjectOpen);
  const setOpen = useUiStore((s) => s.setCreateProjectOpen);
  const openWorkspaceAt = useUiStore((s) => s.openWorkspaceAt);
  const createProject = useWorkspaceStore((s) => s.createProject);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<ProjectKind>('general');
  const [color, setColor] = useState<ProjectColor>('blue');

  const close = () => {
    setOpen(false);
    setName('');
    setKind('general');
    setColor('blue');
  };

  const submit = () => {
    if (!name.trim()) return;
    const project = createProject({ name, kind, color });
    toast.success(`Created “${project.name}”`, 'Find it in the workspace under Projects.');
    close();
    openWorkspaceAt('projects');
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="New project"
      description="Projects keep chats, files, and notes isolated per area of your life."
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="project-name" className="mb-1.5 block text-xs font-medium text-muted">
            Name
          </label>
          <Input
            id="project-name"
            autoFocus
            placeholder="e.g. Side project, Thesis, Marathon plan…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
          <div className="grid grid-cols-4 gap-1.5">
            {PROJECT_KINDS.map(({ kind: k, label, icon: Icon }) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] transition-colors cursor-pointer',
                  kind === k
                    ? 'border-accent bg-accent-soft text-foreground'
                    : 'border-border text-muted hover:bg-surface-hover',
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Color</span>
          <div className="flex gap-2">
            {PROJECT_COLOR_KEYS.map((key) => (
              <button
                key={key}
                aria-label={`Color ${key}`}
                onClick={() => setColor(key)}
                className={cn(
                  'size-6 rounded-full transition-transform cursor-pointer hover:scale-110',
                  color === key && 'ring-2 ring-accent ring-offset-2 ring-offset-surface-raised',
                )}
                style={{ background: PROJECT_COLORS[key].dot }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={submit}>
            Create project
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
