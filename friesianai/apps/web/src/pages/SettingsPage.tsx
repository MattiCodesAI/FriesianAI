import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, KeyRound, Monitor, Moon, Sparkles, Sun } from 'lucide-react';
import type { Theme } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Kbd } from '@/components/ui/Kbd';
import { ModelSelector } from '@/components/topbar/ModelSelector';
import { SHORTCUTS, keyLabel } from '@/constants/shortcuts';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@/constants/app';
import { listProviders } from '@/services/ai/registry';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/utils/cn';

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer',
          checked ? 'bg-accent' : 'bg-surface-active',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white shadow-soft transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

/** Settings: appearance, model defaults, API placeholders, shortcuts, about. */
export function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const defaultModelId = useSettingsStore((s) => s.defaultModelId);
  const setDefaultModelId = useSettingsStore((s) => s.setDefaultModelId);
  const sendOnEnter = useSettingsStore((s) => s.sendOnEnter);
  const setSendOnEnter = useSettingsStore((s) => s.setSendOnEnter);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const setApiKey = useSettingsStore((s) => s.setApiKey);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto w-full max-w-2xl px-6 py-8"
      >
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to workspace
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted">Preferences apply across your whole workspace.</p>

        <div className="mt-6 space-y-5">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors cursor-pointer',
                      theme === value
                        ? 'border-accent bg-accent-soft text-foreground'
                        : 'border-border text-muted hover:bg-surface-hover',
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
              <ToggleRow
                label="Reduced motion"
                description="Minimize animations across the interface."
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </CardContent>
          </Card>

          {/* Models */}
          <Card>
            <CardHeader>
              <CardTitle>Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-4 py-1">
                <div>
                  <p className="text-sm text-foreground">Default model</p>
                  <p className="text-xs text-muted">Used for every new chat.</p>
                </div>
                <ModelSelector value={defaultModelId} onChange={setDefaultModelId} />
              </div>
              <ToggleRow
                label="Send with Enter"
                description="Off: Enter inserts a newline and ⌘/Ctrl+Enter sends."
                checked={sendOnEnter}
                onChange={setSendOnEnter}
              />
            </CardContent>
          </Card>

          {/* API configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted" /> API configuration
                <Badge variant="accent">placeholder</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs leading-5 text-muted">
                Keys are stored locally in this MVP. In production they belong on the server —
                the provider layer is already structured for that swap.
              </p>
              {listProviders()
                .filter((p) => p.requiresApiKey)
                .map((provider) => (
                  <div key={provider.id} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-foreground">{provider.label}</span>
                    <Input
                      type="password"
                      placeholder={`${provider.label} API key`}
                      value={apiKeys[provider.id] ?? ''}
                      onChange={(e) => setApiKey(provider.id, e.target.value)}
                    />
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="shrink-0 text-faint transition-colors hover:text-foreground"
                      aria-label={`${provider.label} website`}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Keyboard shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {SHORTCUTS.map((shortcut) => (
                  <li key={shortcut.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{shortcut.label}</span>
                    <span className="flex items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{keyLabel(key)}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" /> About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                {APP_NAME} <span className="text-faint">v{APP_VERSION}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">{APP_TAGLINE}</p>
              <p className="mt-3 text-xs leading-5 text-faint">
                Built as a long-term foundation: model routing, semantic search, memory, agents,
                and integrations plug into the existing service and provider layers.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
