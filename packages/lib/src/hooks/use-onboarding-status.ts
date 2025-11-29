import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export function useOnboardingStatus() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // Default to true to hide onboarding initially

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const status = localStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(status === 'true');
    }
  }, []);

  const markOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    }
  };

  const resetOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'false');
      setHasSeenOnboarding(false);
    }
  };

  return { hasSeenOnboarding, markOnboardingComplete, resetOnboarding };
}
