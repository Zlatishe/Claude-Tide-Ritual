'use client';

import { JarIcon } from '@/components/jar/JarIcon';
import { useSandboxStore } from '@/stores/sandbox-store';

interface HeaderProps {
  stoneCount: number;
  onJarClick: () => void;
}

export function Header({ stoneCount, onJarClick }: HeaderProps) {
  const useTokens = useSandboxStore((s) => s.useTypographyTokens);

  return (
    <header className="relative z-30 px-5 pt-6 md:px-10 md:pt-8">
      {/* Jar icon — always top-right */}
      <div className="absolute right-5 top-6 md:right-10 md:top-8">
        <JarIcon count={stoneCount} onClick={onJarClick} />
      </div>

      {/* Title — left on mobile, centered on desktop */}
      <div className="md:text-center">
        {useTokens ? (
          <>
            <h1 className="t-h1" style={{ color: 'var(--text-primary-light)' }}>
              The Tide&apos;s Gift
            </h1>
            <p className="t-support mt-2" style={{ color: 'var(--text-secondary-light)' }}>
              A ritual for letting go
            </p>
          </>
        ) : (
          <>
            <h1
              className="text-2xl md:text-4xl font-bold"
              style={{ color: '#313E88' }}
            >
              The Tide&apos;s Gift
            </h1>
            <p
              className="font-normal mt-0.5"
              style={{ color: '#313E88', opacity: 0.5, fontSize: 'clamp(16px, 2vw, 18px)' }}
            >
              A ritual for letting go
            </p>
          </>
        )}
      </div>
    </header>
  );
}
