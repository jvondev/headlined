import { createContext } from 'react';
import type { UseEmblaCarouselType } from "embla-carousel-react";

interface CarouselContextProps {
  setHorizontalEmblaApi: (slug: string, api: UseEmblaCarouselType[1]) => () => void;
  currentPostSlug: string;
  triggerParentScrollDown: () => void; // Added this line
}

export const CarouselContext = createContext<Partial<CarouselContextProps>>({});