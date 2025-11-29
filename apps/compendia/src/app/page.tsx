'use client';


import { Header } from '@repo/ui/components/common/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Compendia
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Discover the latest research papers and scientific breakthroughs, curated daily in a bite-sized format.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/today"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Reading
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-input bg-background px-8 py-3 text-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Compendia. All rights reserved.
      </footer>
    </div>
  );
}
