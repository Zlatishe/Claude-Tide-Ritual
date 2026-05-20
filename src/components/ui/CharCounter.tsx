'use client';

import { CHAR_LIMIT } from '@/lib/utils/constants';

interface CharCounterProps {
  count: number;
  id?: string;
}

export function CharCounter({ count, id }: CharCounterProps) {
  const isNearLimit = count > CHAR_LIMIT * 0.8;
  const isAtLimit = count >= CHAR_LIMIT;
  const isWarning = isNearLimit || isAtLimit;

  return (
    <span
      id={id}
      className="t-caption tabular-nums"
      role="status"
      aria-live="polite"
      style={{
        color: isWarning ? 'var(--terracotta)' : 'var(--text-caption-light)',
      }}
    >
      {count} / {CHAR_LIMIT}{isAtLimit && ' — limit reached'}
    </span>
  );
}
