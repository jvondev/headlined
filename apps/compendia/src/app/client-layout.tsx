"use client";

import { useState, useCallback } from 'react';
import { Toaster } from "@repo/ui/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { FullScreenContext } from '@/context/full-screen-context';
import { BackgroundSyncProvider } from '@/components/background-sync-provider';
import { FooterWrapper } from '@/components/common/FooterWrapper';

import { AdScripts } from '@/components/ad-scripts';

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
        <AdScripts />
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            {children}
          </div>
          <FooterWrapper />
        </div>
        <Toaster />
      </FullScreenContext.Provider>
    </ThemeProvider>
  );
}
