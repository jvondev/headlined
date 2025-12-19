import { type LucideIcon } from "lucide-react";

export type SummaryType = 'article-summary';

export type IconName = "Quote" | "HelpCircle" | "ListChecks" | "Columns" | "ListOrdered" | "BookText" | "BarChart3" | "ShieldAlert" | "Shuffle" | "Info" | "Rss" | "Bookmark" | "MoreVertical" | "ThumbsUp" | "ThumbsDown" | "Pencil" | "ExternalLink" | "ChevronRight";

export interface ArticleSummaryContent {
  snippet: string;
  originalArticleUrl: string;
  slug: string;
  icon?: string;
}

export type SummaryContent = {
  'article-summary': ArticleSummaryContent;
};

// Search-related types
export type SearchableItemType = 'post';

export interface Summary {
  type: SummaryType;
  title: string;
  icon: IconName;
  content: SummaryContent['article-summary'];
}

export interface Post {
  slug: string;
  title: string;
  description: string | null;
  link: string;
  thumbnail_url: string | null;
  topic: string | string[] | null;
  summaries: Summary[];
  date?: string; // YYYY-MM-DD
  // New fields from enhanced scraper
  fullText?: string | null;      // Full article content
  keywords?: string[];           // Top 10 keywords for highlighting
  readingTime?: number;          // Minutes to read
  qualityScore?: number;         // 0.0-1.0 extraction quality
  isPersistent?: boolean;        // If true, post won't be cleared by retention policy
}

export interface SearchableItem {
  id: string;
  slug: string;
  type: SearchableItemType;
  title: string;
  content: string;
  icon: IconName | undefined;
}

export interface SearchResult extends SearchableItem {
  topic: string | null;
}

// Saved Item type
export interface SavedItem {
  id: string; // Unique ID for the saved item, e.g., `slug-post`
  slug: string; // The slug of the parent post
  title: string; // The title of the specific saved card
  type: 'post';
  savedAt: string; // ISO date string
  postData?: Post; // Store full post data for offline/RSS articles
  note?: string; // Optional user-added note
}


export interface Interest {
  name: string;
  aliases: string[] | null;
  icon?: string;
}

export interface Topic {
  name: string;
  icon: string | null;
}

export interface ParserConfig {
  title?: string; // e.g., 'title' or 'dc:title'
  link?: string; // e.g., 'link'
  description?: string; // e.g., 'content:encoded' or 'summary'
  thumbnailUrl?: string; // e.g., 'media:content.$.url' or 'enclosure.$.url'
  pubDate?: string; // e.g., 'pubDate'
}

export interface Source {
  name: string;
  url: string;
  topic: string;
  parserConfig?: ParserConfig;
  maxItems?: number; // Optional: maximum number of items to parse from this source
}