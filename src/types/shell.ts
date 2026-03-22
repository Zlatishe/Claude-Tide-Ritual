import { ShellColorScheme } from '@/lib/utils/constants';

export type ShellVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BeachShell {
  id: string;
  variant: ShellVariant;
  colorScheme: ShellColorScheme;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  inscription: string | null;
  isInscribed: boolean;
}
