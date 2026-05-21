'use client';

import { useState, useEffect } from 'react';
import { useSandboxStore } from '@/stores/sandbox-store';

/**
 * Returns true when the user prefers reduced motion (WCAG 2.3.3).
 * Components should simplify or disable animations when this is true.
 *
 * Also returns true when the sandbox's `forceReducedMotion` toggle is on,
 * so QA can preview reduced-motion without changing OS settings. In the
 * main app the sandbox flag is never set, so this is a no-op there.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const sandboxForce = useSandboxStore((s) => s.forceReducedMotion);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced || sandboxForce;
}
