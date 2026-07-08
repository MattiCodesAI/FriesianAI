import { ChevronDown, Cpu, Sparkles, Zap } from 'lucide-react';
import { DropdownMenu, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/DropdownMenu';
import { MODELS, getModel } from '@/constants/models';
import { listProviders } from '@/services/ai/registry';
import type { ModelTier } from '@/services/ai/types';
import { cn } from '@/utils/cn';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

const tierIcon: Record<ModelTier, typeof Zap> = {
  fast: Zap,
  balanced: Sparkles,
  powerful: Cpu,
};

/**
 * Provider-grouped model picker. Knows nothing about providers beyond the
 * registry metadata — adding a provider automatically adds a section here.
 */
export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const current = getModel(value);

  return (
    <DropdownMenu
      align="end"
      menuClassName="w-64 max-h-96 overflow-y-auto"
      trigger={(open) => (
        <span
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-foreground',
            'transition-colors hover:bg-surface-hover',
            open && 'bg-surface-hover',
          )}
        >
          <span className="max-w-40 truncate font-medium">{current?.label ?? 'Select model'}</span>
          <ChevronDown className={cn('size-3.5 text-faint transition-transform', open && 'rotate-180')} />
        </span>
      )}
    >
      {listProviders().map((provider, index) => {
        const models = MODELS.filter((m) => m.providerId === provider.id);
        if (models.length === 0) return null;
        return (
          <div key={provider.id}>
            {index > 0 && <MenuSeparator />}
            <MenuLabel>{provider.label}</MenuLabel>
            {models.map((model) => {
              const Icon = tierIcon[model.tier];
              return (
                <MenuItem
                  key={model.id}
                  icon={<Icon />}
                  selected={model.id === value}
                  onSelect={() => onChange(model.id)}
                >
                  <span className="flex flex-col">
                    <span>{model.label}</span>
                    <span className="text-[11px] leading-4 text-faint">{model.description}</span>
                  </span>
                </MenuItem>
              );
            })}
          </div>
        );
      })}
    </DropdownMenu>
  );
}
