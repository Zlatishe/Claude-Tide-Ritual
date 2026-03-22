'use client';

import { motion } from 'framer-motion';
import { JarSmall } from '@/components/svg/jars/JarSmall';

interface JarIconProps {
  count: number;
  onClick: () => void;
}

export function JarIcon({ count, onClick }: JarIconProps) {
  return (
    <motion.button
      className="relative cursor-pointer flex-shrink-0"
      aria-label={count > 0 ? `Treasure jar — ${count} sea glass` : 'Treasure jar — empty'}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <JarSmall className="w-[36px] h-[48px]" />

      {/* Count inside jar body */}
      {count > 0 && (
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          key={count}
          initial={{ scale: 0.5 }}
          animate={{ scale: [1, 1.2, 0.95, 1.05, 1] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#E49C75' }}
          >
            <span className="text-[11px] font-bold leading-none" style={{ color: '#313E88' }}>
              {count}
            </span>
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}
