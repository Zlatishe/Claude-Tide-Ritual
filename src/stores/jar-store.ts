'use client';

import { create } from 'zustand';
import type { JarStone, StoneVariant } from '@/types/stone';

interface JarState {
  stoneCount: number;
  stones: JarStone[];
  isJarModalOpen: boolean;
  isAnimatingStones: boolean;

  addStones: (count: number) => void;
  openJar: () => void;
  closeJar: () => void;
  setStones: (stones: JarStone[]) => void;
  setAnimatingStones: (val: boolean) => void;
  hydrateJar: (stoneCount: number, stones: JarStone[]) => void;
}

let stoneIdCounter = 0;

function createStoneId(): string {
  return `stone-${++stoneIdCounter}-${Date.now()}`;
}

const STONE_VARIANTS: StoneVariant[] = [3, 6, 7, 8];

function generateStonePosition(index: number, total: number): { x: number; y: number } {
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: Math.min(0.80, Math.max(0.22, 0.22 + (col / Math.max(cols - 1, 1)) * 0.56 + (Math.random() - 0.5) * 0.08)),
    y: Math.min(0.82, Math.max(0.30, 0.80 - (row / Math.max(Math.ceil(total / cols) - 1, 1)) * 0.45 + (Math.random() - 0.5) * 0.05)),
  };
}

export const useJarStore = create<JarState>((set, get) => ({
  stoneCount: 0,
  stones: [],
  isJarModalOpen: false,
  isAnimatingStones: false,

  addStones: (count) =>
    set((state) => {
      const newStones: JarStone[] = [];
      const newTotal = state.stoneCount + count;

      for (let i = 0; i < count; i++) {
        const stoneIndex = state.stoneCount + i;
        const pos = generateStonePosition(stoneIndex, newTotal);
        newStones.push({
          id: createStoneId(),
          variant: STONE_VARIANTS[Math.floor(Math.random() * STONE_VARIANTS.length)],
          colorSeed: Math.floor(Math.random() * 1000),
          x: pos.x,
          y: pos.y,
          rotation: (Math.random() - 0.5) * 60,
          scale: 0.6 + Math.random() * 0.5,
        });
      }

      return {
        stoneCount: newTotal,
        stones: [...state.stones, ...newStones],
      };
    }),

  openJar: () => set({ isJarModalOpen: true }),
  closeJar: () => set({ isJarModalOpen: false }),
  setStones: (stones) => set({ stones, stoneCount: stones.length }),
  setAnimatingStones: (val) => set({ isAnimatingStones: val }),

  hydrateJar: (stoneCount, stones) =>
    set({ stoneCount, stones }),
}));
