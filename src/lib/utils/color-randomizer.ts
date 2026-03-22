import { SHELL_COLOR_SCHEMES, type ShellColorScheme } from './constants';

export function getRandomColorScheme(): ShellColorScheme {
  return SHELL_COLOR_SCHEMES[Math.floor(Math.random() * SHELL_COLOR_SCHEMES.length)];
}

export function getRandomShellVariant(): number {
  return Math.floor(Math.random() * 7) + 1;
}

export function getRandomStoneVariant(): number {
  const variants = [3, 6, 7, 8];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function getRandomRotation(range: number = 25): number {
  return (Math.random() - 0.5) * 2 * range;
}

export function getRandomScale(min: number = 0.7, max: number = 1.3): number {
  return min + Math.random() * (max - min);
}
