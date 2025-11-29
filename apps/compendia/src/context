
'use client';

import { useState, useCallback, ReactNode, useRef } from 'react';
import { OnboardingContext } from './onboarding-context';
import { UseEmblaCarouselType } from 'embla-carousel-react';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [verticalEmblaApi, setVerticalEmblaApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const horizontalEmblaApis = useRef<Map<string, UseEmblaCarouselType[1] | null>>(new Map());
  const [onboardingActive, setOnboardingActive] = useState(false);

  const triggerScrollDown = useCallback(() => {
    if (verticalEmblaApi) {
      verticalEmblaApi.scrollNext();
    }
  }, [verticalEmblaApi]);

  const triggerScrollRight = useCallback((slug: string) => {
    const api = horizontalEmblaApis.current.get(slug);
    if (api) {
      api.scrollNext();
    }
  }, []);

  const setHorizontalEmblaApi = useCallback((slug: string, api: UseEmblaCarouselType[1]) => {
    horizontalEmblaApis.current.set(slug, api);
    return () => {
      horizontalEmblaApis.current.delete(slug);
    };
  }, []);

  const contextValue = {
    triggerScrollDown,
    triggerScrollRight,
    setOnboardingActive,
    isEmblaApiReady: !!verticalEmblaApi,
    setVerticalEmblaApi,
    setHorizontalEmblaApi,
    onboardingActive,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}
