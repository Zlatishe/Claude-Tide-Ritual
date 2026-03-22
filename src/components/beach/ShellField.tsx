'use client';

import { Shell } from './Shell';
import { useBeachStore } from '@/stores/beach-store';

interface ShellFieldProps {
  onShellClick: (shellId: string) => void;
  constraintsRef?: React.RefObject<HTMLDivElement | null>;
}

export function ShellField({ onShellClick, constraintsRef }: ShellFieldProps) {
  const shells = useBeachStore((s) => s.shells);

  return (
    <div className="absolute inset-0" style={{ top: '10%', bottom: '22%', zIndex: 2 }}>
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
          constraintsRef={constraintsRef}
        />
      ))}
    </div>
  );
}
