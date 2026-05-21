// Shared tide-release easing constants.
//
// Cubic-bezier values intentionally exceed the [0, 1] box:
//   easeOutBack: y1 = 1.56 → overshoot at peak (wave swells slightly past target then settles)
//   easeInBack:  y1 = -0.56 → "anticipation" at start (water gathers up before retreating)
// Plain ease-in/ease-out stays within [0, 1] and reads as UI motion, not water.
//
// Used by both TideRelease (production wash) and WaveSweep (onboarding wash) so
// the two animations stay in sync.

export const easeOutBack: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
export const easeInBack:  [number, number, number, number] = [0.36, 0, 0.66, -0.56];
export const idleEase:    [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export interface PhaseConfig {
  ease: [number, number, number, number];
  delay: number;     // seconds
  duration: number;  // seconds
}

export interface LayerConfig {
  rise: PhaseConfig;
  recede: PhaseConfig;
}

export const TIDE_LAYER_1: LayerConfig = {
  rise:   { ease: easeOutBack, delay: 0.1, duration: 3.0 },
  recede: { ease: easeInBack,  delay: 0.4, duration: 3.5 },
};
export const TIDE_LAYER_2: LayerConfig = {
  rise:   { ease: easeOutBack, delay: 0.2, duration: 3.3 },
  recede: { ease: easeInBack,  delay: 0.2, duration: 3.2 },
};
export const TIDE_LAYER_3: LayerConfig = {
  rise:   { ease: easeOutBack, delay: 0.35, duration: 3.5 },
  recede: { ease: easeInBack,  delay: 0,    duration: 2.8 },
};
