import { Stone3 } from './Stone3';
import { Stone6 } from './Stone6';
import { Stone7 } from './Stone7';
import { Stone8 } from './Stone8';
import type { ShellColorScheme } from '@/lib/utils/constants';
import type { ComponentType } from 'react';

export type StoneVariant = 3 | 6 | 7 | 8;

export interface StoneSVGProps {
  colorScheme?: ShellColorScheme;
  className?: string;
}

export const STONE_COMPONENTS: ComponentType<StoneSVGProps>[] = [
  Stone3, Stone6, Stone7, Stone8,
];

const STONE_MAP: Record<StoneVariant, ComponentType<StoneSVGProps>> = {
  3: Stone3,
  6: Stone6,
  7: Stone7,
  8: Stone8,
};

export function getStoneComponent(variant: StoneVariant): ComponentType<StoneSVGProps> {
  return STONE_MAP[variant];
}

export { Stone3, Stone6, Stone7, Stone8 };
