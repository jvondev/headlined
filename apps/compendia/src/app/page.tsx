'use client';

import { VerticalFeed } from '@/components/vertical-feed';
import { Header } from '@repo/ui/components/common/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 w-full">
        <VerticalFeed />
      </main>
    </div>
  );
}
