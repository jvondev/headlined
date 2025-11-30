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
  topic: string | null;
  summaries: Summary[];
  date?: string; // YYYY-MM-DD
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

// OpenAlex Types
export interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string;
  display_name: string;
  publication_year: number;
  publication_date: string;
  ids: {
    openalex: string;
    doi?: string;
    mag?: string;
  };
  primary_location: {
    source: {
      display_name: string;
    } | null;
    pdf_url: string | null;
    landing_page_url: string | null;
  };
  open_access: {
    is_oa: boolean;
    oa_status: string;
    oa_url: string | null;
    any_repository_has_fulltext: boolean;
  };
  authorships: {
    author: { display_name: string; id: string; orcid?: string };
    raw_affiliation_string: string;
    institutions: { display_name: string; id: string; country_code: string }[];
    is_corresponding: boolean;
  }[];
  biblio: {
    volume: string | null;
    issue: string | null;
    first_page: string | null;
    last_page: string | null;
  };
  cited_by_count: number;
  abstract_inverted_index: { [key: string]: number[] } | null;
  concepts: { display_name: string; score: number; level: number }[];
  topics: {
    display_name: string;
    score: number;
    domain: { display_name: string };
    field: { display_name: string };
    subfield: { display_name: string };
  }[];
  keywords: { display_name: string; score: number }[];
  fwci: number | null;
  citation_normalized_percentile: { value: number; is_in_top_1_percent: boolean; is_in_top_10_percent: boolean } | null;
}

export interface CompendiaPost {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  affiliations: string[];
  journal: string;
  date: string;
  citationCount: number;
  pdfUrl: string | null;
  landingPageUrl: string | null;
  tags: string[];
  keywords: { display_name: string; score: number }[];
  topics: { display_name: string; score: number; domain: string; field: string; subfield: string }[];
  concepts: { display_name: string; score: number; level: number }[];
  doi: string | null;
  isOpenAccess: boolean;
  openAccess: { status: string; is_oa: boolean; oa_url: string | null; oa_status: string };
  volume: string | null;
  issue: string | null;
  publication_date: string;
  fwci: number | null;
  citation_normalized_percentile: { value: number; is_in_top_1_percent: boolean; is_in_top_10_percent: boolean } | null;
  primary_location: { source: string; license: string | null; version: string | null } | null;
}
