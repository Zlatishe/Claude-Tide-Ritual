export type StoneVariant = 3 | 6 | 7 | 8;

export interface JarStone {
  id: string;
  variant: StoneVariant;
  colorSeed: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}
