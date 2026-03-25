'use client';

import { motion } from 'framer-motion';

interface SignInScreenProps {
  onSignIn: () => void;
  isLoading: boolean;
  privacyText?: string;
}

export function SignInScreen({ onSignIn, isLoading, privacyText }: SignInScreenProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#FFE3D5' }}
    >
      <motion.div
        className="flex flex-col items-center text-center max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Decorative wave line */}
        <svg
          width="80"
          height="24"
          viewBox="0 0 80 24"
          fill="none"
          className="mb-6 opacity-40"
          aria-hidden="true"
        >
          <path
            d="M0 12C10 4 20 20 30 12C40 4 50 20 60 12C70 4 80 20 80 12"
            stroke="#313E88"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <h1
          className="text-3xl md:text-5xl font-bold mb-2"
          style={{ color: '#313E88' }}
        >
          The Tide&apos;s Gift
        </h1>

        <p
          className="font-normal mb-15"
          style={{ color: '#313E88', opacity: 0.5, fontSize: 'clamp(16px, 2vw, 18px)' }}
        >
          A ritual for letting go
        </p>

        <motion.button
          onClick={onSignIn}
          disabled={isLoading}
          className="px-8 py-3 rounded-full font-semibold text-base cursor-pointer"
          style={{
            backgroundColor: '#E49C75',
            color: '#292E64',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          {isLoading ? 'Loading...' : 'Sign in with Google'}
        </motion.button>

        <p
          className="mt-6 font-light"
          style={{ color: '#656980', fontSize: 14 }}
        >
          {privacyText || 'Your thoughts are private and only visible to you'}
        </p>
      </motion.div>
    </div>
  );
}
