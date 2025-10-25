import { getTopics } from "@/data/topics";
import { getInterests } from "@/data/interests";
import { getServerRssFeeds } from "@/lib/server-rss";
import ExploreClientPage from "./ExploreClientPage";

export const revalidate = 3600; // Revalidate every hour

export default async function ExplorePage() {
  const [topics, interests, feeds] = await Promise.all([
    getTopics(),
    getInterests(),
    getServerRssFeeds(),
  ]);

  return <ExploreClientPage topics={topics} interests={interests} feeds={feeds} />;
}