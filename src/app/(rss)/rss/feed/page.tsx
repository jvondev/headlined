import { getRssFeed, rssToInsight } from "@/lib/rss";
import { InsightPageClient } from "@/app/insight/[slug]/client";
import { getFeedCategories, getFeedInfoFromUrl } from "@/data/rss-feeds";
import { Insight } from "@/types";

type RssFeedPageProps = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export default async function RssFeedPage({ searchParams }: RssFeedPageProps) {
    const sourceUrl = searchParams.source as string;
    let insights: Insight[] = [];
    let selectedCategory = "";

    if (sourceUrl) {
        const articles = await getRssFeed(sourceUrl);
        insights = await Promise.all(articles.map(rssToInsight));
        const feedInfo = await getFeedInfoFromUrl(sourceUrl);
        if (feedInfo) {
            selectedCategory = feedInfo.category;
        }
    }

    const categories = await getFeedCategories();

    return (
        <InsightPageClient
            initialInsights={insights}
            slug={''}
            rssCategories={categories}
            rssSelectedCategory={selectedCategory}
            initialHasMore={false} // Since we load a single feed, we have all items.
        />
    );
}
