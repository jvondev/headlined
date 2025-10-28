
"use client"; // Add this line if not already present, as useOnboardingStatus is a client hook

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status'; // Import the hook
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'; // Import the OnboardingFlow component
import { useState, useCallback } from 'react';
import { FullScreenContext } from '@/context/full-screen-context';
import { BackgroundSyncProvider } from '@/components/background-sync-provider'; // Import the BackgroundSyncProvider
import { cn } from '@/lib/utils';

// Metadata can't be client-side, so keep it outside the client component
// export const metadata: Metadata = {
//   title: 'ReadMore',
//   description: 'A new way to discover and consume content.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-119CNXCR97"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-119CNXCR97');
        `,
          }}
        />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "1a3c52cd54ef44838d0cd99b4bf2f638"}'></script>
      </head>
      <body className="font-body antialiased h-screen overflow-hidden flex flex-col" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FullScreenContext.Provider value={{ isFullScreen, toggleFullScreen }}>
            <BackgroundSyncProvider /> {/* Render the background sync provider */}
            <div className="flex-grow overflow-y-auto no-scrollbar">
              {children}
            </div>
            
            <Toaster />
          </FullScreenContext.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
