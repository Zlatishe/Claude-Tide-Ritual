'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharCounter } from '@/components/ui/CharCounter';
import { getShellComponent, SHELL_NAMES, type ShellVariant } from '@/components/svg/shells';
import type { ShellColorScheme } from '@/lib/utils/constants';
import { CHAR_LIMIT } from '@/lib/utils/constants';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';

interface InscriptionModalProps {
  isOpen: boolean;
  shellVariant: ShellVariant;
  shellColorScheme: ShellColorScheme;
  onClose: () => void;
  onInscribe: (text: string) => void;
  initialText?: string;
}

export function InscriptionModal({
  isOpen,
  shellVariant,
  shellColorScheme,
  onClose,
  onInscribe,
  initialText,
}: InscriptionModalProps) {
  const [text, setText] = useState(initialText || '');
  const [isAtLimit, setIsAtLimit] = useState(false);
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
      setIsAtLimit(false);
    }
  }, [isOpen, initialText]);
  const ShellSVG = getShellComponent(shellVariant);
  const shellName = SHELL_NAMES[shellVariant];

  const handleInscribe = useCallback(() => {
    if (text.trim().length > 0) {
      onInscribe(text.trim());
      setText('');
    }
  }, [text, onInscribe]);

  const handleClose = useCallback(() => {
    setText('');
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={focusTrapRef}
          className="fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inscription-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Full-page opaque background */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#FFE3D5' }}
          >
            {/* Close button — top-right, consistent */}
            <button
              className="absolute top-5 right-5 md:top-8 md:right-8 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer z-10"
              style={{
                backgroundColor: 'rgba(49,62,136,0.1)',
                color: '#313E88',
              }}
              onClick={handleClose}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <motion.div
              className="w-full max-w-sm px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Shell illustration */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 mb-3" aria-hidden="true">
                  <ShellSVG colorScheme={shellColorScheme} className="w-full h-full" />
                </div>
                <span
                  className="font-normal"
                  style={{ color: '#A35930', fontSize: '14px' }}
                >
                  {shellName}
                </span>
              </div>

              {/* Question */}
              <h2
                id="inscription-heading"
                className="text-xl md:text-2xl font-bold text-center mb-5"
                style={{ color: '#313E88' }}
              >
                What&apos;s on your mind?
              </h2>

              {/* Text area */}
              <div className="relative">
                <motion.textarea
                  id="inscription-text"
                  value={text}
                  onChange={(e) => {
                    if (e.target.value.length <= CHAR_LIMIT) {
                      setText(e.target.value);
                      setIsAtLimit(false);
                    } else {
                      setIsAtLimit(true);
                      setTimeout(() => setIsAtLimit(false), 600);
                    }
                  }}
                  placeholder="Write it here, then let the tide take it..."
                  className="w-full h-28 md:h-32 p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 placeholder:text-sm"
                  style={{
                    backgroundColor: 'white',
                    color: '#313E88',
                    border: `1px solid ${isAtLimit ? '#E49C75' : 'rgba(201,209,255,0.5)'}`,
                  }}
                  animate={isAtLimit ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.3 }}
                  autoFocus
                  aria-labelledby="inscription-heading"
                  aria-describedby="char-counter"
                />
                <div className="flex justify-end mt-1.5 pr-1">
                  <CharCounter count={text.length} id="char-counter" />
                </div>
              </div>

              {/* Inscribe button */}
              <div className="flex justify-center mt-4">
                <motion.button
                  className="px-6 py-2.5 rounded-full font-semibold text-sm cursor-pointer"
                  style={{
                    backgroundColor: text.trim().length > 0 ? '#E49C75' : 'rgba(228,156,117,0.4)',
                    color: text.trim().length > 0 ? '#292E64' : 'rgba(41,46,100,0.5)',
                  }}
                  whileHover={text.trim().length > 0 ? { scale: 1.05 } : {}}
                  whileTap={text.trim().length > 0 ? { scale: 0.96 } : {}}
                  onClick={handleInscribe}
                  disabled={text.trim().length === 0}
                >
                  Ready to drift
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
