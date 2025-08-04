
import { getInsightsBySlugs } from "@/lib/insights";
import { PageHeader } from "@/components/shared/page-header";
import SavedPageClient from "./client";
import { cookies } from 'next/headers';
import type { SavedItem, Insight } from "@/types";

async function getSavedItems(cookieStore: any): Promise<SavedItem[]> {
  const savedItemsCookie = cookieStore.get('savedItems');
  if (savedItemsCookie) {
    try {
      return JSON.parse(savedItemsCookie.value);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export default async function SavedPage() {
    const cookieStore = cookies();
    const savedItems = await getSavedItems(cookieStore);
    const insightSlugs = savedItems.map(item => item.slug);
    const insights = await getInsightsBySlugs(insightSlugs);

    const insightsWithSavedData = insights.map(insight => {
        const savedItem = savedItems.find(item => item.slug === insight.slug)!;
        return { ...insight, savedItem };
    });

    return (
        <div className="bg-background min-h-screen">
            <PageHeader title="Saved Items" />

            <main className="container mx-auto px-4 py-8 pt-24">
                <SavedPageClient initialInsights={insightsWithSavedData} />
            </main>
        </div>
    );
}
