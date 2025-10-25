import type { Source } from "@/types";

export const sourcesData: Omit<Source, 'id' | 'created_at' | 'updated_at' | 'topic_id'>[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
  },
  {
    name: "BBC News",
    url: "http://feeds.bbci.co.uk/news/rss.xml",
  },
];