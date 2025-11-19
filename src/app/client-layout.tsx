"use client";

import { useState, useCallback } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { FullScreenContext } from '@/context/full-screen-context';
import { BackgroundSyncProvider } from '@/components/background-sync-provider';
import { FooterWrapper } from '@/components/common/FooterWrapper';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <FullScreenContext.Provider value={{ isFullScreen, toggleFullScreen }}>
        <BackgroundSyncProvider />
        <div className="h-full">
          {children}
        </div>
        <FooterWrapper />
        <Toaster />
      </FullScreenContext.Provider>
    </ThemeProvider>
  );
}
