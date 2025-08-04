
import { getFeedCategories } from "@/data/rss-feeds";
import { InsightPageClient } from "@/app/insight/[slug]/client";

type RssPageProps = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export default async function RssPage({ searchParams }: RssPageProps) {
    const categories = await getFeedCategories();
    // Default to the first category if none is selected
    const selectedCategory = (searchParams.category as string) || categories[0];
    
    // We no longer pre-fetch insights on the server for the main RSS page.
    // The client component will handle showing a skeleton and fetching the data.
    return (
        <InsightPageClient
            initialInsights={[]}
            slug={""} // No initial slug, client will handle it
            rssCategories={categories}
            rssSelectedCategory={selectedCategory}
            initialHasMore={true} // Assume there's more to load initially
        />
    );
}
