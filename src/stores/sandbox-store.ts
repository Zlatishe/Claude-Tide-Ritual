'use client';

/**
 * Sandbox config store.
 *
 * Read by sandbox UI for control state. Optionally read by individual
 * components when a design-experiment toggle is wired up (e.g. JarModal
 * reading `balancedJarCopy` to switch its support-line copy).
 *
 * In production (the main app route) this store is never written to and
 * always returns its initial values, so reading from it is a no-op.
 */

import { create } from 'zustand';

export type SandboxScene = 'beach' | 'onboarding' | 'signin';

interface SandboxState {
  // Scene navigation
  scene: SandboxScene;
  onboardingStep: number; // 0–3 (step 4 = signin, exposed via the "signin" scene)

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

  // Design experiments — FIX-01 toggles.
  // These are plumbed but most are off-by-default and not yet wired into
  // components. As FIX-01 sections land, the implementer should read these
  // flags at the relevant render sites so QA can compare before/after.
  useTypographyTokens: boolean;     // §1 — token-based type roles vs current hardcoded styles
  balancedJarCopy: boolean;          // §2 — couplet with <br> in JarModal support line
  ghostReadyToDriftCta: boolean;     // §3 — outline/ghost "Ready to drift" vs primary
  organicWaveMotion: boolean;        // §4 — counter-current + y-bob vs unified linear slide
  unifiedShellModuleType: boolean;   // §5 — token-based heading/textarea sizes in InscriptionModal

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
  ghostReadyToDriftCta: false,
  organicWaveMotion: false,
  unifiedShellModuleType: false,
};

export const useSandboxStore = create<SandboxState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<SandboxState>),
  reset: () => set(initial),
}));
