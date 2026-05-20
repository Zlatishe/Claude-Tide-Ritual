'use client';

import { JarIcon } from '@/components/jar/JarIcon';

interface HeaderProps {
  stoneCount: number;
  onJarClick: () => void;
}

export function Header({ stoneCount, onJarClick }: HeaderProps) {
  return (
    <header className="relative z-30 px-5 pt-6 md:px-10 md:pt-8">
      {/* Jar icon — always top-right */}
      <div className="absolute right-5 top-6 md:right-10 md:top-8">
        <JarIcon count={stoneCount} onClick={onJarClick} />
      </div>

      {/* Title — left on mobile, centered on desktop */}
      <div className="md:text-center">
        <h1 className="t-h1" style={{ color: 'var(--text-primary-light)' }}>
          The Tide&apos;s Gift
        </h1>
        <p className="t-support mt-2" style={{ color: 'var(--text-secondary-light)' }}>
          A ritual for letting go
        </p>
      </div>
    </header>
  );
}
