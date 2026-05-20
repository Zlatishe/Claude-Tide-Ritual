import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sandbox — The Tide\'s Gift',
  robots: { index: false, follow: false },
};

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
