import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { ModelSelector } from '@/components/topbar/ModelSelector';
import { useSettingsStore } from '@/store/settingsStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { projectKindLabel } from '@/constants/projects';
import { formatDate } from '@/utils/time';

/**
 * Project context: instructions injected into every chat in the project,
 * plus the project's preferred model.
 */
export function ContextTab({ projectId }: { projectId: string }) {
  const project = useWorkspaceStore((s) => s.projects.find((p) => p.id === projectId));
  const updateProject = useWorkspaceStore((s) => s.updateProject);
  const globalDefaultModelId = useSettingsStore((s) => s.defaultModelId);

  if (!project) return null;

  return (
    <div className="space-y-4 p-3">
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-faint">About</h4>
        <div className="mt-2 space-y-1.5 text-xs text-muted">
          <p className="flex items-center justify-between">
            <span>Type</span>
            <Badge>{projectKindLabel(project.kind)}</Badge>
          </p>
          <p className="flex items-center justify-between">
            <span>Created</span>
            <span className="text-foreground">{formatDate(project.createdAt)}</span>
          </p>
        </div>
        {project.description && (
          <p className="mt-2 text-xs leading-5 text-muted">{project.description}</p>
        )}
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-faint">
          Default model
        </h4>
        <p className="mb-2 mt-1 text-[11px] leading-4 text-faint">
          New chats in this project start with this model.
        </p>
        <ModelSelector
          value={project.defaultModelId ?? globalDefaultModelId}
          onChange={(modelId) => updateProject(project.id, { defaultModelId: modelId })}
        />
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-faint">
          Project instructions
        </h4>
        <p className="mb-2 mt-1 text-[11px] leading-4 text-faint">
          Sent as system context with every chat in this project.
        </p>
        <Textarea
          key={project.id}
          defaultValue={project.instructions}
          placeholder="e.g. Always answer in concise bullet points…"
          rows={5}
          className="text-xs leading-5"
          onBlur={(e) => {
            if (e.target.value !== project.instructions) {
              updateProject(project.id, { instructions: e.target.value });
            }
          }}
        />
      </section>

      <p className="text-[11px] leading-4 text-faint">
        Long-term memories live in the workspace's Memory section and are included in every chat
        automatically.
      </p>
    </div>
  );
}
