import { Shell1 } from './Shell1';
import { Shell2 } from './Shell2';
import { Shell3 } from './Shell3';
import { Shell4 } from './Shell4';
import { Shell5 } from './Shell5';
import { Shell6 } from './Shell6';
import { Shell7 } from './Shell7';
import type { ShellColorScheme } from '@/lib/utils/constants';
import type { ComponentType } from 'react';

export type ShellVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ShellSVGProps {
  colorScheme?: ShellColorScheme;
  className?: string;
}

export const SHELL_COMPONENTS: ComponentType<ShellSVGProps>[] = [
  Shell1, Shell2, Shell3, Shell4, Shell5, Shell6, Shell7,
];

export const SHELL_NAMES: Record<ShellVariant, string> = {
  1: 'Found near the pier',
  2: 'Smooth and salt-washed',
  3: 'Heavier than it looks',
  4: 'Worn down by the current',
  5: 'Carried in on the last wave',
  6: 'Tumbled by the tide',
  7: 'Still warm from the sun',
};

export function getShellComponent(variant: ShellVariant): ComponentType<ShellSVGProps> {
  return SHELL_COMPONENTS[variant - 1];
}

export { Shell1, Shell2, Shell3, Shell4, Shell5, Shell6, Shell7 };
