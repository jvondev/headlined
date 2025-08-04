
import { getRandomInsightSlug } from '@/lib/insights';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const randomSlug = await getRandomInsightSlug();
  
  if (randomSlug) {
    redirect(`/insight/${randomSlug}`);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">InsightScroll</h1>
        <p className="mt-2 text-lg text-muted-foreground">No insights available at the moment.</p>
      </div>
    </main>
  );
}
