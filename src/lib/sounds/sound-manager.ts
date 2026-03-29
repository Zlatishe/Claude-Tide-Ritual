import { Howl } from 'howler';

export type SoundName =
  | 'sand-drag'
  | 'shell-tap'
  | 'shell-placed'
  | 'wave-wash'
  | 'stone-added'
  | 'jar-modal';

const SOUND_CONFIG: Record<SoundName, { src: string; volume: number; loop?: boolean }> = {
  'sand-drag':    { src: '/sounds/sand-drag.mp3',    volume: 0.6, loop: true },
  'shell-tap':    { src: '/sounds/shell-tap.mp3',    volume: 0.7 },
  'shell-placed': { src: '/sounds/shell-placed.mp3', volume: 0.7 },
  'wave-wash':    { src: '/sounds/wave-wash.mp3',    volume: 0.5 },
  'stone-added':  { src: '/sounds/stone-added.mp3',  volume: 0.65 },
  'jar-modal':    { src: '/sounds/jar-modal.mp3',    volume: 0.7 },
};

class SoundManager {
  private sounds: Map<SoundName, Howl> = new Map();
  private _enabled = true;

  private getOrCreate(name: SoundName): Howl {
    let howl = this.sounds.get(name);
    if (!howl) {
      const config = SOUND_CONFIG[name];
      howl = new Howl({
        src: [config.src],
        volume: config.volume,
        loop: config.loop ?? false,
        preload: true,
      });
      this.sounds.set(name, howl);
    }
    return howl;
  }

  play(name: SoundName): void {
    if (!this._enabled) return;
    // Skip long ambient sounds for users who prefer reduced motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      name === 'wave-wash'
    ) {
      return;
    }
    this.getOrCreate(name).play();
  }

  stop(name: SoundName): void {
    const howl = this.sounds.get(name);
    if (howl) howl.stop();
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(val: boolean) {
    this._enabled = val;
  }

  preloadAll(): void {
    for (const name of Object.keys(SOUND_CONFIG) as SoundName[]) {
      this.getOrCreate(name);
    }
  }
}

export const soundManager = new SoundManager();
