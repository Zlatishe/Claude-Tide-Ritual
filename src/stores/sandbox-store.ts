'use client';

/**
 * Sandbox config store.
 *
 * Read by sandbox UI for control state. Optionally read by individual
 * components when a design-experiment toggle is wired up.
 *
 * In production (the main app route) this store is never written to and
 * always returns its initial values, so reading from it is a no-op.
 */

import { create } from 'zustand';

export type SandboxScene = 'beach' | 'onboarding' | 'signin';

interface SandboxState {
  // Scene navigation
  scene: SandboxScene;
  onboardingStep: number;

  // Beach state controls
  inscribedShellCount: number;
  jarStoneCount: number;

  // Modal triggers
  forceJarModalOpen: boolean;
  forceInscriptionModalOpen: boolean;
  forceTideInProgress: boolean;

  // Display
  forceReducedMotion: boolean;
  hideUIChrome: boolean;
  controlsOpen: boolean;
  controlsSide: 'left' | 'right';

  // ── Design experiments ──────────────────────────────────────────────────

  // FIX-01 (kept)
  useTypographyTokens: boolean;     // §1 — token-based type roles
  balancedJarCopy: boolean;          // §2 — couplet <br> in JarModal support line
  organicWaveMotion: boolean;        // §4a — counter-current + larger y-bobs
  unifiedShellModuleType: boolean;   // §5 — token-based sizes in InscriptionModal

  // FIX-02 §3 — JarModal type balance (t-hero count, t-h2 heading, fluid support)
  refinedJarBalance: boolean;

  // FIX-02 §4 — Wave experiment toggles (independent, mix-and-match)
  wavePathMorphing: boolean;       // Animate SVG path 'd' through phase-shifted keyframes
  waveSecondaryHarmonic: boolean;  // Overlay high-freq ripple on each wave path
  waveAmplitudeBreathing: boolean; // Slow scaleY breath per layer, anchored at bottom
  waveFoamStreaks: boolean;        // Independent drifting foam lines on wave surface

  // Setters
  set: <K extends keyof Omit<SandboxState, 'set' | 'reset'>>(
    key: K,
    value: SandboxState[K]
  ) => void;
  reset: () => void;
}

const initial = {
  scene: 'beach' as SandboxScene,
  onboardingStep: 0,
  inscribedShellCount: 0,
  jarStoneCount: 0,
  forceJarModalOpen: false,
  forceInscriptionModalOpen: false,
  forceTideInProgress: false,
  forceReducedMotion: false,
  hideUIChrome: false,
  controlsOpen: true,
  controlsSide: 'right' as 'left' | 'right',
  useTypographyTokens: false,
  balancedJarCopy: false,
  organicWaveMotion: false,
  unifiedShellModuleType: false,
  refinedJarBalance: false,
  wavePathMorphing: false,
  waveSecondaryHarmonic: false,
  waveAmplitudeBreathing: false,
  waveFoamStreaks: false,
};

export const useSandboxStore = create<SandboxState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<SandboxState>),
  reset: () => set(initial),
}));
