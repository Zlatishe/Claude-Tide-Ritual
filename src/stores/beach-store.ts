'use client';

import { create } from 'zustand';
import type { ShellVariant } from '@/components/svg/shells';
import type { ShellColorScheme } from '@/lib/utils/constants';
import { SHELL_COLOR_SCHEMES } from '@/lib/utils/constants';
import { generateShellPositions, getShellCount } from '@/lib/utils/shell-positioning';

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

interface BeachState {
  shells: BeachShell[];
  activeShellId: string | null;
  isInscriptionModalOpen: boolean;
  isTideInProgress: boolean;
  toastMessage: string | null;
  hasGeneratedShells: boolean;

  generateShells: (viewportWidth: number, viewportHeight: number) => void;
  openInscription: (shellId: string) => void;
  closeInscription: () => void;
  inscribeShell: (shellId: string, text: string) => void;
  startTideRelease: () => void;
  completeTideRelease: (viewportWidth: number, viewportHeight: number) => void;
  showTideToast: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  moveShell: (shellId: string, x: number, y: number) => void;
  getInscribedCount: () => number;
  getActiveShell: () => BeachShell | undefined;
  hydrateInscriptions: (inscriptions: { text: string; shellVariant: number }[]) => void;
}

let shellIdCounter = 0;

function createShellId(): string {
  return `shell-${++shellIdCounter}-${Date.now()}`;
}

export const useBeachStore = create<BeachState>((set, get) => ({
  shells: [],
  activeShellId: null,
  isInscriptionModalOpen: false,
  isTideInProgress: false,
  toastMessage: null,
  hasGeneratedShells: false,

  generateShells: (viewportWidth, viewportHeight) => {
    const count = getShellCount(viewportWidth);
    const positions = generateShellPositions(count, viewportWidth, viewportHeight);

    const shells: BeachShell[] = positions.map((pos) => ({
      id: createShellId(),
      variant: (Math.floor(Math.random() * 7) + 1) as ShellVariant,
      colorScheme: SHELL_COLOR_SCHEMES[Math.floor(Math.random() * SHELL_COLOR_SCHEMES.length)],
      x: pos.x,
      y: pos.y,
      rotation: pos.rotation,
      scale: pos.scale,
      inscription: null,
      isInscribed: false,
    }));

    set({ shells, hasGeneratedShells: true });
  },

  openInscription: (shellId) =>
    set({ activeShellId: shellId, isInscriptionModalOpen: true }),

  closeInscription: () =>
    set({ activeShellId: null, isInscriptionModalOpen: false }),

  inscribeShell: (shellId, text) =>
    set((state) => ({
      shells: state.shells.map((s) =>
        s.id === shellId
          ? { ...s, inscription: text, isInscribed: true }
          : s
      ),
      isInscriptionModalOpen: false,
      activeShellId: null,
    })),

  startTideRelease: () => set({ isTideInProgress: true }),

  completeTideRelease: (viewportWidth, viewportHeight) => {
    const inscribedCount = get().shells.filter((s) => s.isInscribed).length;
    const count = getShellCount(viewportWidth);
    const positions = generateShellPositions(count, viewportWidth, viewportHeight);

    const newShells: BeachShell[] = positions.map((pos) => ({
      id: createShellId(),
      variant: (Math.floor(Math.random() * 7) + 1) as ShellVariant,
      colorScheme: SHELL_COLOR_SCHEMES[Math.floor(Math.random() * SHELL_COLOR_SCHEMES.length)],
      x: pos.x,
      y: pos.y,
      rotation: pos.rotation,
      scale: pos.scale,
      inscription: null,
      isInscribed: false,
    }));

    set({
      isTideInProgress: false,
      shells: newShells,
    });
  },

  showTideToast: () => {
    const inscribedCount = get().shells.filter((s) => s.isInscribed).length;
    set({
      toastMessage: inscribedCount > 0
        ? `You're ${inscribedCount} thought${inscribedCount > 1 ? 's' : ''} lighter. A new piece of sea glass rests in your jar`
        : null,
    });
  },

  moveShell: (shellId, x, y) =>
    set((state) => ({
      shells: state.shells.map((s) =>
        s.id === shellId ? { ...s, x, y } : s
      ),
    })),

  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),

  getInscribedCount: () => get().shells.filter((s) => s.isInscribed).length,
  getActiveShell: () => {
    const state = get();
    return state.shells.find((s) => s.id === state.activeShellId);
  },

  hydrateInscriptions: (inscriptions) =>
    set((state) => {
      // Apply saved inscriptions to current shells (match by index, up to available shells)
      const updatedShells = [...state.shells];
      inscriptions.forEach((insc, i) => {
        if (i < updatedShells.length) {
          updatedShells[i] = {
            ...updatedShells[i],
            inscription: insc.text,
            isInscribed: true,
          };
        }
      });
      return { shells: updatedShells };
    }),
}));
