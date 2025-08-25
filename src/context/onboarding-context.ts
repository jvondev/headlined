// src/context/onboarding-context.ts
import { createContext, useContext } from 'react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

interface OnboardingContextType {
  triggerScrollDown: () => void;
  triggerScrollRight: () => void;
  setOnboardingActive: (active: boolean) => void;
  isEmblaApiReady: boolean;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}
