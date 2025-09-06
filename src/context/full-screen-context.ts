
import { createContext, useContext } from 'react';

interface FullScreenContextType {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

export const FullScreenContext = createContext<FullScreenContextType | undefined>(undefined);

export const useFullScreen = () => {
  const context = useContext(FullScreenContext);
  if (context === undefined) {
    throw new Error('useFullScreen must be used within a FullScreenProvider');
  }
  return context;
};
