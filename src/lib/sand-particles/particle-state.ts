/**
 * Module-level mutable state singleton.
 * Shell.tsx writes drag positions here; the canvas rAF loop reads every frame.
 * Plain object — no React, no Zustand — zero re-renders in the hot path.
 */

export interface DragSource {
  id: string;
  x: number; // absolute screen px
  y: number; // absolute screen px
  active: boolean;
  radius: number; // repulsion radius in px
}

export interface BurstEvent {
  x: number;
  y: number;
  strength: number;
  timestamp: number;
}

export const sandInteraction = {
  /** Currently active drag sources (one per shell being dragged) */
  dragSources: new Map<string, DragSource>(),

  /** Queue of burst events — consumed and cleared by the engine each frame */
  burstQueue: [] as BurstEvent[],

  startDrag(id: string, x: number, y: number, radius: number) {
    this.dragSources.set(id, { id, x, y, active: true, radius });
  },

  updateDrag(id: string, x: number, y: number) {
    const source = this.dragSources.get(id);
    if (source) {
      source.x = x;
      source.y = y;
    }
  },

  endDrag(id: string) {
    this.dragSources.delete(id);
  },

  triggerBurst(x: number, y: number, strength: number = 1) {
    this.burstQueue.push({ x, y, strength, timestamp: performance.now() });
  },
};
