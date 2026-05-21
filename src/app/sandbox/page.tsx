'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSandboxStore } from '@/stores/sandbox-store';
import { useBeachStore } from '@/stores/beach-store';
import { useJarStore } from '@/stores/jar-store';
import { SignInScreen } from '@/components/ui/SignInScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { SandboxControls } from './SandboxControls';

const BeachScene = dynamic(
  () => import('@/components/beach/BeachScene').then((m) => m.BeachScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen" style={{ backgroundColor: '#FFE3D5' }} />
    ),
  }
);

const noop = () => {};

export default function SandboxPage() {
  const scene = useSandboxStore((s) => s.scene);
  const onboardingStep = useSandboxStore((s) => s.onboardingStep);
  const inscribedShellCount = useSandboxStore((s) => s.inscribedShellCount);
  const jarStoneCount = useSandboxStore((s) => s.jarStoneCount);
  const hideUIChrome = useSandboxStore((s) => s.hideUIChrome);

  const shells = useBeachStore((s) => s.shells);
  const generateShells = useBeachStore((s) => s.generateShells);
  const inscribeShell = useBeachStore((s) => s.inscribeShell);
  const hydrateJar = useJarStore((s) => s.hydrateJar);
  const stones = useJarStore((s) => s.stones);

  // --- Inscribed shells sync ---
  // When the slider changes, ensure the first N shells are inscribed
  // and the rest are not. Uses a re-generate strategy when we need to
  // *un*-inscribe, since the store has no `uninscribeShell` action.
  const prevInscribedTarget = useRef(0);
  useEffect(() => {
    if (scene !== 'beach') return;
    if (shells.length === 0) return;

    const currentInscribed = shells.filter((sh) => sh.isInscribed).length;
    const target = Math.min(inscribedShellCount, shells.length);

    if (target === currentInscribed) {
      prevInscribedTarget.current = target;
      return;
    }

    if (target > currentInscribed) {
      // Inscribe additional uninscribed shells from the front.
      const uninscribed = shells.filter((sh) => !sh.isInscribed);
      const toInscribe = uninscribed.slice(0, target - currentInscribed);
      toInscribe.forEach((sh) => inscribeShell(sh.id, '(sandbox preview)'));
    } else {
      // Reset and re-inscribe to the lower target — cheapest way without
      // adding a new store action.
      generateShells(window.innerWidth, window.innerHeight);
      // After regen, an effect run will re-fire because `shells` changes;
      // it'll pick up the new target on the next tick.
    }
    prevInscribedTarget.current = target;
  }, [scene, inscribedShellCount, shells, inscribeShell, generateShells]);

  // --- Jar stones sync ---
  // Hydrate the jar with exactly N stones whenever the slider changes.
  // We synthesize stone records directly so we get deterministic-ish layout
  // without going through `addStones` (which only adds, never sets-absolute).
  useEffect(() => {
    if (stones.length === jarStoneCount) return;
    const variants = [3, 6, 7, 8] as const;
    const synthetic = Array.from({ length: jarStoneCount }, (_, i) => ({
      id: `sandbox-stone-${i}`,
      variant: variants[i % variants.length],
      colorSeed: (i * 137) % 1000,
      x: 0.5,
      y: 0.5,
      rotation: 0,
      scale: 1,
    }));
    hydrateJar(jarStoneCount, synthetic);
  }, [jarStoneCount, stones.length, hydrateJar]);

  // --- Render the selected scene ---
  const sceneEl =
    scene === 'signin' ? (
      <SignInScreen
        onSignIn={noop}
        isLoading={false}
        privacyText="Sandbox preview — sign-in is a no-op."
      />
    ) : scene === 'onboarding' ? (
      <OnboardingFlow
        key={`onboarding-${onboardingStep}`}
        initialStep={onboardingStep}
        onSignIn={noop}
        isLoading={false}
      />
    ) : (
      <BeachScene />
    );

  return (
    <div className="relative w-full h-dvh">
      <div className={hideUIChrome ? 'sandbox-hide-chrome' : ''}>{sceneEl}</div>

      {/* Sandbox watermark — always visible so this can never be mistaken for prod */}
      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[55] pointer-events-none px-3 py-1 rounded-full text-[10px] font-bold tracking-wider"
        style={{
          backgroundColor: 'rgba(49,62,136,0.85)',
          color: 'white',
          backdropFilter: 'blur(6px)',
        }}
      >
        SANDBOX · /sandbox
      </div>

      <SandboxControls />

      {/* Hide-chrome CSS — applied conditionally above */}
      <style jsx global>{`
        .sandbox-hide-chrome header,
        .sandbox-hide-chrome [role='status'] {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
