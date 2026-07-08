import { useMatch } from 'react-router-dom';
import { Moon, PanelRight, Sun } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip } from '@/components/ui/Tooltip';
import { ModelSelector } from './ModelSelector';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore, resolveTheme } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { keyLabel } from '@/constants/shortcuts';

/**
 * A whisper of a top bar: the model on the left, the workspace on the right.
 * Everything else lives in the sidebar or settings.
 */
export function TopBar() {
  const conversationMatch = useMatch('/c/:conversationId');
  const conversationId = conversationMatch?.params.conversationId;

  const conversation = useChatStore((s) =>
    conversationId ? s.conversations.find((c) => c.id === conversationId) : undefined,
  );
  const setConversationModel = useChatStore((s) => s.setConversationModel);

  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const defaultModelId = useSettingsStore((s) => s.defaultModelId);
  const setDefaultModelId = useSettingsStore((s) => s.setDefaultModelId);

  const workspaceOpen = useUiStore((s) => s.workspaceOpen);
  const toggleWorkspace = useUiStore((s) => s.toggleWorkspace);

  const isDark = resolveTheme(theme) === 'dark';

  return (
    <header className="flex h-13 shrink-0 items-center justify-between px-3">
      <ModelSelector
        value={conversation?.modelId ?? defaultModelId}
        onChange={(modelId) => {
          if (conversation) setConversationModel(conversation.id, modelId);
          else setDefaultModelId(modelId);
        }}
      />

      <div className="flex items-center gap-1">
        <IconButton
          label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </IconButton>

        <Tooltip
          content={
            <span className="flex items-center gap-1.5">
              Workspace <Kbd>{keyLabel('mod')}</Kbd>
              <Kbd>.</Kbd>
            </span>
          }
        >
          <IconButton
            label="Toggle workspace"
            hideTooltip
            active={workspaceOpen}
            onClick={toggleWorkspace}
          >
            <PanelRight className="size-4" />
          </IconButton>
        </Tooltip>
      </div>
    </header>
  );
}
