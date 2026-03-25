'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/use-auth';
import { useJarSync } from '@/lib/hooks/use-jar-sync';
import { useInscriptionSync } from '@/lib/hooks/use-inscription-sync';
import { SignInScreen } from '@/components/ui/SignInScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check localStorage for onboarding status (in useEffect to avoid SSR mismatch)
  useEffect(() => {
    const completed = localStorage.getItem('tides-onboarding-complete');
    setNeedsOnboarding(!completed);
    setHasCheckedOnboarding(true);
  }, []);

  // Sync hooks — safe to call unconditionally, they no-op when userId is null
  useJarSync(userId);
  const { saveInscription, clearInscriptions } = useInscriptionSync(userId);

  // Loading state — wait for both auth and onboarding check
  if (isLoading || !hasCheckedOnboarding) {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: '#FFE3D5' }} />
    );
  }

  // Signed in — show beach
  if (isSignedIn) {
    return (
      <ErrorBoundary>
        <BeachScene
          onInscribe={saveInscription}
          onTideRelease={clearInscriptions}
        />
      </ErrorBoundary>
    );
  }

  // Not signed in, first visit — show onboarding
  if (needsOnboarding) {
    return <OnboardingFlow onSignIn={signIn} isLoading={isLoading} />;
  }

  // Not signed in, returning user — show sign-in directly
  return <SignInScreen onSignIn={signIn} isLoading={isLoading} />;
}
