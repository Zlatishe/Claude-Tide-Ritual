'use client';

import { useRef } from 'react';
import { Shell } from './Shell';
import { useBeachStore } from '@/stores/beach-store';

interface ShellFieldProps {
  onShellClick: (shellId: string) => void;
}

export function ShellField({ onShellClick }: ShellFieldProps) {
  const shells = useBeachStore((s) => s.shells);

  // Playfield ref — shells are draggable only within this box (sand area,
  // between header bottom and wave top). This prevents shells drifting into
  // the header where they'd become stuck behind z-30 elements.
  const playfieldRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={playfieldRef}
      className="absolute inset-0"
      style={{ top: '10%', bottom: '22%', zIndex: 2 }}
    >
      {shells.map((shell, index) => (
        <Shell
          key={shell.id}
          id={shell.id}
          variant={shell.variant}
          colorScheme={shell.colorScheme}
          x={shell.x}
          y={shell.y}
          rotation={shell.rotation}
          scale={shell.scale}
          isInscribed={shell.isInscribed}
          index={index}
          onClick={onShellClick}
          constraintsRef={playfieldRef}
        />
      ))}
    </div>
  );
}
