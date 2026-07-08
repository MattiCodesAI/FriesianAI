import {
  Briefcase,
  Code2,
  Dumbbell,
  FlaskConical,
  Folder,
  GraduationCap,
  PenLine,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { ProjectColor, ProjectKind } from '@/types';

export const PROJECT_KINDS: Array<{ kind: ProjectKind; label: string; icon: LucideIcon }> = [
  { kind: 'personal', label: 'Personal', icon: User },
  { kind: 'coding', label: 'Coding', icon: Code2 },
  { kind: 'research', label: 'Research', icon: FlaskConical },
  { kind: 'business', label: 'Business', icon: Briefcase },
  { kind: 'university', label: 'University', icon: GraduationCap },
  { kind: 'sat', label: 'SAT', icon: PenLine },
  { kind: 'fitness', label: 'Fitness', icon: Dumbbell },
  { kind: 'general', label: 'General', icon: Folder },
];

export function projectIcon(kind: ProjectKind): LucideIcon {
  return PROJECT_KINDS.find((k) => k.kind === kind)?.icon ?? Folder;
}

export function projectKindLabel(kind: ProjectKind): string {
  return PROJECT_KINDS.find((k) => k.kind === kind)?.label ?? 'General';
}

/**
 * Project accent palette. Values are applied via inline styles so Tailwind
 * never needs to see dynamic class names.
 */
export const PROJECT_COLORS: Record<ProjectColor, { dot: string; soft: string }> = {
  blue: { dot: '#5b8def', soft: 'rgba(91, 141, 239, 0.16)' },
  violet: { dot: '#9d7bea', soft: 'rgba(157, 123, 234, 0.16)' },
  green: { dot: '#4fae72', soft: 'rgba(79, 174, 114, 0.16)' },
  amber: { dot: '#d9a44c', soft: 'rgba(217, 164, 76, 0.16)' },
  rose: { dot: '#e0678f', soft: 'rgba(224, 103, 143, 0.16)' },
  cyan: { dot: '#48a8c5', soft: 'rgba(72, 168, 197, 0.16)' },
  orange: { dot: '#e08a4f', soft: 'rgba(224, 138, 79, 0.16)' },
  slate: { dot: '#8b93a0', soft: 'rgba(139, 147, 160, 0.16)' },
};

export const PROJECT_COLOR_KEYS = Object.keys(PROJECT_COLORS) as ProjectColor[];
