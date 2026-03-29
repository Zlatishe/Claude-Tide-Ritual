'use client';

import { useCallback, useEffect } from 'react';
import { soundManager, type SoundName } from '@/lib/sounds/sound-manager';

export function useSound() {
  useEffect(() => {
    soundManager.preloadAll();
  }, []);

  const play = useCallback((name: SoundName) => {
    soundManager.play(name);
  }, []);

  const stop = useCallback((name: SoundName) => {
    soundManager.stop(name);
  }, []);

  return { play, stop };
}
