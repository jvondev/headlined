import type { Source } from "@/types";

export const sourcesData: Omit<Source, 'id' | 'created_at' | 'updated_at' | 'topic_id'>[] = [
  {
    name: "Yahoo News",
    url: "https://news.yahoo.com/rss/",
    topic: "news",
    parserConfig: {
      title: 'title',
      link: 'link',
      pubDate: 'pubDate',
      thumbnailUrl: 'media.content[0].url', // Adjusted path for media:content
    },
    maxItems: 5, // Example: parse a maximum of 5 items from this source
  }
];