'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/use-auth';
import { useJarSync } from '@/lib/hooks/use-jar-sync';
import { useInscriptionSync } from '@/lib/hooks/use-inscription-sync';
import { SignInScreen } from '@/components/ui/SignInScreen';

const BeachScene = dynamic(
  () => import('@/components/beach/BeachScene').then((m) => m.BeachScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen" style={{ backgroundColor: '#FFE3D5' }} />
    ),
  }
);

export default function Home() {
  const { userId, isLoading, isSignedIn, signIn } = useAuth();

  // Sync hooks — safe to call unconditionally, they no-op when userId is null
  useJarSync(userId);
  const { saveInscription, clearInscriptions } = useInscriptionSync(userId);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: '#FFE3D5' }} />
    );
  }

  // Not signed in — show sign-in screen
  if (!isSignedIn) {
    return <SignInScreen onSignIn={signIn} isLoading={isLoading} />;
  }

  // Signed in — show beach
  return (
    <BeachScene
      onInscribe={saveInscription}
      onTideRelease={clearInscriptions}
    />
  );
}
