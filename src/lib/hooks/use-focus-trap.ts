'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Traps focus inside a modal container (WCAG 2.4.3).
 * - Cycles Tab/Shift+Tab through focusable elements inside the container.
 * - Closes on Escape key.
 * - Restores focus to the previously focused element on unmount.
 */
export function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);

      // Focus first focusable element on next tick
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;
        const autofocus = container.querySelector<HTMLElement>('[autofocus]');
        const firstFocusable = container.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        (autofocus || firstFocusable)?.focus();
      });

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  return containerRef;
}
