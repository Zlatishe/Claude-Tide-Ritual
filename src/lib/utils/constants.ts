export const PALETTE = {
  sand: '#FFE3D5',
  terracotta: '#E49C75',
  lavender: '#C9D1FF',
  navy: '#313E88',
  navyDark: '#292E64',
  navyMid: '#323F86',
  warmBrown: '#A35930',
  muted: '#656980',
  jarShadow: '#4358A1',
  jarHighlight: '#F6F6F3',
} as const;

export type ShellColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
};

export const SHELL_COLOR_SCHEMES: ShellColorScheme[] = [
  { primary: '#323F86', secondary: '#E49C75', accent: '#C9D1FF' },
  { primary: '#292E64', secondary: '#E49C75', accent: '#C9D1FF' },
  { primary: '#313E88', secondary: '#C9D1FF', accent: '#E49C75' },
  { primary: '#323F86', secondary: '#FFE3D5', accent: '#C9D1FF' },
];

export const CHAR_LIMIT = 140;

export const SHELL_COUNTS = {
  mobile: { min: 4, max: 5 },
  tablet: { min: 6, max: 7 },
  desktop: { min: 8, max: 10 },
} as const;
