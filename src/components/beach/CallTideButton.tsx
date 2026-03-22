'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CallTideButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function CallTideButton({ visible, onClick }: CallTideButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ bottom: 'var(--content-bottom)' }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.button
            className="px-6 py-3 rounded-full font-semibold text-sm cursor-pointer"
            style={{
              backgroundColor: '#E49C75',
              color: '#292E64',
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
          >
            Wash it away
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
