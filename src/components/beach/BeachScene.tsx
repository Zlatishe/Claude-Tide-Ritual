'use client';

import { useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SandSurface } from './SandSurface';
import { ShellField } from './ShellField';
import { WaveComposition } from './WaveComposition';
import { CallTideButton } from './CallTideButton';
import { Header } from '@/components/ui/Header';
import { Toast } from '@/components/ui/Toast';
import { InscriptionModal } from '@/components/modals/InscriptionModal';
import { JarModal } from '@/components/modals/JarModal';
import { TideRelease } from '@/components/effects/TideRelease';
import { SandParticleCanvas } from './SandParticleCanvas';
import { useBeachStore } from '@/stores/beach-store';
import { useJarStore } from '@/stores/jar-store';
import { useSound } from '@/lib/hooks/use-sound';

interface BeachSceneProps {
  onInscribe?: (text: string, shellVariant: number) => void;
  onTideRelease?: () => void;
}

export function BeachScene({ onInscribe, onTideRelease }: BeachSceneProps) {
  const shells = useBeachStore((s) => s.shells);
  const hasGeneratedShells = useBeachStore((s) => s.hasGeneratedShells);
  const generateShells = useBeachStore((s) => s.generateShells);
  const openInscription = useBeachStore((s) => s.openInscription);
  const closeInscription = useBeachStore((s) => s.closeInscription);
  const inscribeShell = useBeachStore((s) => s.inscribeShell);
  const isInscriptionModalOpen = useBeachStore((s) => s.isInscriptionModalOpen);
  const activeShellId = useBeachStore((s) => s.activeShellId);
  const isTideInProgress = useBeachStore((s) => s.isTideInProgress);
  const startTideRelease = useBeachStore((s) => s.startTideRelease);
  const completeTideRelease = useBeachStore((s) => s.completeTideRelease);
  const showTideToast = useBeachStore((s) => s.showTideToast);
  const toastMessage = useBeachStore((s) => s.toastMessage);
  const clearToast = useBeachStore((s) => s.clearToast);

  const stoneCount = useJarStore((s) => s.stoneCount);
  const isJarModalOpen = useJarStore((s) => s.isJarModalOpen);
  const openJar = useJarStore((s) => s.openJar);
  const closeJar = useJarStore((s) => s.closeJar);

  const { play } = useSound();

  const activeShell = shells.find((s) => s.id === activeShellId);
  const inscribedShells = shells.filter((s) => s.isInscribed);
  const inscribedCount = inscribedShells.length;
  const hasInscribedShells = inscribedCount > 0;
  const firstInscribed = inscribedShells[0];

  useEffect(() => {
    if (!hasGeneratedShells) {
      generateShells(window.innerWidth, window.innerHeight);
    }
  }, [hasGeneratedShells, generateShells]);

  const handleShellClick = useCallback((shellId: string) => {
    const shell = shells.find((s) => s.id === shellId);
    if (shell) {
      openInscription(shellId);
    }
  }, [shells, openInscription]);

  const handleInscribe = useCallback((text: string) => {
    if (activeShellId) {
      const shell = shells.find((s) => s.id === activeShellId);
      inscribeShell(activeShellId, text);
      if (shell && onInscribe) {
        onInscribe(text, shell.variant);
      }
    }
  }, [activeShellId, shells, inscribeShell, onInscribe]);

  const handleTideRelease = useCallback(() => {
    startTideRelease();
  }, [startTideRelease]);

  const handleTideToast = useCallback(() => {
    showTideToast();
  }, [showTideToast]);

  const handleTideComplete = useCallback(() => {
    completeTideRelease(window.innerWidth, window.innerHeight);
    if (onTideRelease) {
      onTideRelease();
    }
  }, [completeTideRelease, onTideRelease]);

  const handleJarClick = useCallback(() => {
    play('jar-modal');
    openJar();
  }, [play, openJar]);

  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={viewportRef} className="relative w-full h-dvh overflow-hidden">
      {/* Sand background */}
      <SandSurface />

      {/* Interactive sand particle field */}
      <SandParticleCanvas />

      {/* Header */}
      <Header stoneCount={stoneCount} onJarClick={handleJarClick} />

      {/* CTA text — positioned above wave area, hidden when inscribed shells exist */}
      <AnimatePresence>
        {!hasInscribedShells && !isTideInProgress && (
          <motion.div
            className="absolute left-0 w-full text-center z-10 pointer-events-none px-4"
            style={{ bottom: 'var(--content-bottom)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="font-medium"
              style={{ color: '#313E88', fontSize: 18 }}
            >
              Choose a shell to hold a thought
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shells — hidden during tide release so sand is clear when wave recedes */}
      <AnimatePresence>
        {!isTideInProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ShellField onShellClick={handleShellClick} constraintsRef={viewportRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call the Tide button */}
      <CallTideButton visible={hasInscribedShells && !isTideInProgress} onClick={handleTideRelease} />

      {/* Wave animation at bottom */}
      <WaveComposition />

      {/* Tide release overlay */}
      <TideRelease
        isActive={isTideInProgress}
        inscribedCount={inscribedCount}
        onShowToast={handleTideToast}
        onComplete={handleTideComplete}
        shellVariant={firstInscribed?.variant}
        shellColorScheme={firstInscribed?.colorScheme}
      />

      {/* Inscription modal */}
      {activeShell && (
        <InscriptionModal
          isOpen={isInscriptionModalOpen}
          shellVariant={activeShell.variant}
          shellColorScheme={activeShell.colorScheme}
          onClose={closeInscription}
          onInscribe={handleInscribe}
          initialText={activeShell.inscription || ''}
        />
      )}

      {/* Jar modal */}
      <JarModal isOpen={isJarModalOpen} onClose={closeJar} />

      {/* Toast notification */}
      <Toast message={toastMessage} onDismiss={clearToast} />
    </div>
  );
}
