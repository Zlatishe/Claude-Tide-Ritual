export const springs = {
  shellLand: { type: 'spring' as const, stiffness: 200, damping: 15, mass: 0.8 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 10, mass: 0.5 },
  modal: { type: 'spring' as const, stiffness: 250, damping: 25, mass: 1 },
  breathe: { type: 'spring' as const, stiffness: 50, damping: 8, mass: 1.5 },
  snap: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },
};
