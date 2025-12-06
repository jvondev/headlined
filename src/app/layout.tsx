import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { ClientLayout } from './client-layout';

export const metadata: Metadata = {
  title: 'Headlined',
  description: 'Made for digital minimalists who quit social media but still want to know what’s going on. A simple swipe news app showing the day’s most important stories, so you can stay informed without doomscrolling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar h-full">
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="icon" href="/headlined-logo.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#f0f0f0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased no-scrollbar h-full" suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>

        {/* Analytics Scripts - Loaded after hydration */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-119CNXCR97"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-119CNXCR97');
          `}
        </Script>

        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon='{"token": "1a3c52cd54ef44838d0cd99b4bf2f638"}'
        />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )}
      </body>
    </html>
  );
}
