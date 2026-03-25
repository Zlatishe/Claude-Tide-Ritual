'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onDismiss, 6000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]"
          role="status"
          aria-live="polite"
          style={{ bottom: 'var(--toast-bottom)' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div
            className="px-5 py-3.5 rounded-xl shadow-lg border flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              borderColor: 'rgba(201,209,255,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold flex items-center" style={{ color: '#313E88' }}>
                <svg className="mr-1.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1" />
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1" />
                  <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2s2.4 2 5 2c1.3 0 1.9-.5 2.5-1" />
                </svg>
                {message.split('.')[0]}
              </p>
              {message.includes('.') && (
                <p className="text-xs mt-0.5" style={{ color: '#313E88', opacity: 0.7 }}>
                  {message.split('.').slice(1).join('.').trim()}
                </p>
              )}
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 w-11 h-11 -mr-2 flex items-center justify-center rounded-full cursor-pointer"
              style={{ color: '#313E88', opacity: 0.4 }}
              aria-label="Dismiss"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
