'use client';

import { useState, useCallback } from 'react';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { BottomNavigationBar } from '@/components/bottom-nav';
import { FullScreenContext } from '@/context/full-screen-context';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toaster";
import { OnboardingProvider } from '@/context/onboarding-provider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  const showOnboarding = hasSeenOnboarding === false;

  return (
    <OnboardingProvider>
      <FullScreenContext.Provider value={{ isFullScreen, toggleFullScreen }}>
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {children}
          {showOnboarding && <OnboardingFlow onComplete={markOnboardingComplete} />}
        </div>
        <BottomNavigationBar className={cn({ "hidden": isFullScreen })} />
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </FullScreenContext.Provider>
    </OnboardingProvider>
  );
}
