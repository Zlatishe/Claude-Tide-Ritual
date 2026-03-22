import { Variants } from 'framer-motion';

export const shellIdle: Variants = {
  idle: (i: number) => ({
    y: [0, -4, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: {
      duration: 3.5 + (i % 3) * 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.3,
    },
  }),
};

export const shellHover: Variants = {
  rest: { scale: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0))' },
  hover: {
    scale: 1.08,
    filter: 'drop-shadow(0 6px 16px rgba(49,62,136,0.25))',
    transition: { type: 'spring', stiffness: 400, damping: 15 },
  },
  tap: { scale: 0.95 },
};

export const shellLanding: Variants = {
  initial: { y: -60, opacity: 0, scale: 0.7, rotate: -15 },
  animate: (i: number) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: i * 0.15,
    },
  }),
};

export const haloGlow: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: [0.3, 0.6, 0.3],
    scale: [0.95, 1.08, 0.95],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const readyTag: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.8 },
  visible: {
    opacity: 1,
    y: [0, -6, 0],
    scale: 1,
    transition: {
      opacity: { duration: 0.3 },
      y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      scale: { type: 'spring', stiffness: 300, damping: 10 },
    },
  },
};

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 250, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

export const toastSlide: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export const jarBadgeBounce: Variants = {
  idle: { scale: 1 },
  bump: {
    scale: [1, 1.4, 0.9, 1.1, 1],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};
