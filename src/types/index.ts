
import { type LucideIcon } from "lucide-react";

export type DeepDiveType = 'quote' | 'qna' | 'checklist' | 'comparison' | 'howto' | 'case-study' | 'data' | 'myth' | 'alternatives' | 'metadata' | 'article-summary';

export type IconName = "Quote" | "HelpCircle" | "ListChecks" | "Columns" | "ListOrdered" | "BookText" | "BarChart3" | "ShieldAlert" | "Shuffle" | "Info" | "Rss" | "Bookmark" | "MoreVertical" | "ThumbsUp" | "ThumbsDown" | "Pencil" | "ExternalLink" | "ChevronRight";

export interface QnaItem {
  q: string;
  a: string;
}

export interface ChecklistItem {
  text: string;
  isDone: boolean;
}

export interface ComparisonItem {
  feature: string;
  itemA: string;
  itemB: string;
}

export interface HowToStep {
  title: string;
  description: string;
}

export interface DataPoint {
    value: string;
    label: string;
}

export interface AlternativeItem {
    name:string;
    description: string;
}

export interface MetadataItem {
    label: string;
    value: string;
}

export interface ArticleSummaryContent {
    snippet: string;
    originalArticleUrl: string;
    slug: string;
}

export type DeepDiveContent = {
  quote: { text: string; author: string; };
  qna: { questions: QnaItem[]; };
  checklist: { items: ChecklistItem[]; };
  comparison: { titleA: string; titleB: string; items: ComparisonItem[]; };
  howto: { steps: HowToStep[]; };
  'case-study': { problem: string; solution: string; result: string; };
  data: { points: DataPoint[]; };
  myth: { myth: string; fact: string; };
  alternatives: { points: AlternativeItem[]; };
  metadata: { items: MetadataItem[] };
  'article-summary': ArticleSummaryContent;
};

export interface DeepDive<T extends DeepDiveType> {
  type: T;
  title: string;
  icon: IconName;
  content: DeepDiveContent[T];
}

export interface Insight {
  slug: string;
  seo: {
    title: string;
    description: string;
  };
  category: string[];
  title: string;
  description: string;
  thumbnailUrl?: string;
  deepDives: DeepDive<DeepDiveType>[];
  blogContent: string;
  originalFeedUrl?: string; // Add originalFeedUrl field
  author?: string; // Add optional author field
  isAd?: boolean; // Flag to identify ad placeholders
}

// Search-related types
export type SearchableItemType = 'insight' | 'blog' | DeepDiveType;

export interface SearchableItem {
  id: string;
  slug: string;
  type: SearchableItemType;
  title: string;
  content: string;
  deepDiveIndex?: number;
  icon: IconName | undefined;
}

export interface SearchResult extends SearchableItem {
  category: string;
}

// Saved Item type
export interface SavedItem {
    id: string; // Unique ID for the saved item, e.g., `slug-insight` or `slug-dd-2`
    slug: string; // The slug of the parent insight
    title: string; // The title of the specific saved card
    type: 'blog' | 'insight' | DeepDiveType;
    deepDiveIndex?: number; // Index if it's a deep dive
    savedAt: string; // ISO date string
    insightData?: Insight; // Store full insight data for offline/RSS articles
    note?: string; // Optional user-added note
}


// RSS-related types
export interface RssArticle {
    slug: string;
    title: string;
    description: string;
    link: string;
    pubDate: string | undefined;
    author: string;
    thumbnailUrl: string;
    blogContent: string;
    originalFeedUrl: string;
    deepDives: DeepDive<DeepDiveType>[];
    categories: string[];
}

export interface RssFeed {
    name: string;
    url: string;
    category: string;
    sourceName: string; // e.g., 'bbc', 'verge'
    fallbackIconUrl?: string; // URL for a high-quality fallback logo
    cardBackgroundColor?: string;
    labelFontColor?: string;
}
