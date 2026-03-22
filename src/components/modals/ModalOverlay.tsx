'use client';

import { motion } from 'framer-motion';

interface ModalOverlayProps {
  onClick: () => void;
  children: React.ReactNode;
  bgColor?: string;
}

export function ModalOverlay({ onClick, children, bgColor }: ModalOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: bgColor ?? 'rgba(41,46,100,0.5)' }}
        onClick={onClick}
      />
      {/* Content */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
