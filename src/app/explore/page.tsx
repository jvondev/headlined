import { getTopics } from "@/data/topics";
import { getAllInterests } from "@/data/interests";
import ExploreClientPage from "./ExploreClientPage";

export const revalidate = 3600; // Revalidate every hour

export default async function ExplorePage() {
  const [topics, interests] = await Promise.all([
    getTopics(),
    getAllInterests(),
  ]);

  return <ExploreClientPage topics={topics} interests={interests} feeds={[]} />;
}