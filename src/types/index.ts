import { type LucideIcon } from "lucide-react";

export type SummaryType = 'article-summary';

export type IconName = "Quote" | "HelpCircle" | "ListChecks" | "Columns" | "ListOrdered" | "BookText" | "BarChart3" | "ShieldAlert" | "Shuffle" | "Info" | "Rss" | "Bookmark" | "MoreVertical" | "ThumbsUp" | "ThumbsDown" | "Pencil" | "ExternalLink" | "ChevronRight";

export interface ArticleSummaryContent {
    snippet: string;
    originalArticleUrl: string;
    slug: string;
}

export type SummaryContent = {
  'article-summary': ArticleSummaryContent;
};

export interface Summary {
  type: SummaryType;
  title: string;
  icon: IconName;
  content: SummaryContent['article-summary'];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  link: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  topic_id: string | null;
  summaries: Summary[];
}

// Search-related types
export type SearchableItemType = 'post';

export interface SearchableItem {
  id: string;
  slug: string;
  type: SearchableItemType;
  title: string;
  content: string;
  icon: IconName | undefined;
}

export interface SearchResult extends SearchableItem {
  topic_id: string | null;
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

export interface Source {
    name: string;
    url: string;
}