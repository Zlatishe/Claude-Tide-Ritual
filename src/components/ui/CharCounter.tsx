'use client';

import { CHAR_LIMIT } from '@/lib/utils/constants';

interface CharCounterProps {
  count: number;
  id?: string;
}

export function CharCounter({ count, id }: CharCounterProps) {
  const isNearLimit = count > CHAR_LIMIT * 0.8;
  const isAtLimit = count >= CHAR_LIMIT;

  return (
    <span
      id={id}
      className="font-light tabular-nums"
      role="status"
      aria-live="polite"
      style={{
        fontSize: '14px',
        color: isAtLimit
          ? '#A35930'
          : isNearLimit
          ? '#A35930'
          : '#656980',
      }}
    >
      {count} / {CHAR_LIMIT}{isAtLimit && ' — limit reached'}
    </span>
  );
}
