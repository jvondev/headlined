import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Post } from '@/types';

interface CarouselState {
  posts: Post[];
  hasMore: boolean;
  page: number;
  activeSlideIndex: number;
}

interface CarouselStateContextType {
  getCarouselState: (key: string) => CarouselState | undefined;
  setCarouselState: (key: string, state: CarouselState) => void;
}

const CarouselStateContext = createContext<CarouselStateContextType | undefined>(undefined);

export const CarouselStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allCarouselStates, setAllCarouselStates] = useState<Record<string, CarouselState>>({});

  const getCarouselState = useCallback((key: string) => {
    return allCarouselStates[key];
  }, [allCarouselStates]);

  const setCarouselState = useCallback((key: string, state: CarouselState) => {
    setAllCarouselStates(prevStates => ({
      ...prevStates,
      [key]: state,
    }));
  }, []);

  return (
    <CarouselStateContext.Provider value={{ getCarouselState, setCarouselState }}>
      {children}
    </CarouselStateContext.Provider>
  );
};

export const useCarouselState = () => {
  const context = useContext(CarouselStateContext);
  if (context === undefined) {
    throw new Error('useCarouselState must be used within a CarouselStateProvider');
  }
  return context;
};
