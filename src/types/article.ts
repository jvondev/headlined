import { Post } from './index';

/**
 * Internal Article - extends Post with admin/CMS fields
 */
export interface InternalArticle extends Post {
    id: string;
    category: string;      // From CATEGORIES[].id
    subcategory: string;   // From CATEGORIES[].items[].slug
    status: 'draft' | 'published';
    createdAt: string;     // ISO date
    updatedAt: string;     // ISO date
    seoTitle?: string;
    seoDescription?: string;
    // AI generation metadata
    aiGenerated?: boolean;
    sourceKeywords?: string[];
    // E-E-A-T enhancements
    sources?: { title: string; url: string }[];
    factsCited?: string[];
    lastVerified?: string;
}

/**
 * Article storage structure
 */
export interface ArticleStorage {
    version: number;
    articles: InternalArticle[];
}

/**
 * AI Generation input - simplified for single-request generation
 */
export interface AIGenerationInput {
    keyword: string;
    relatedKeywords?: string[];
    // Category/subcategory now optional - AI will suggest
    category?: string;
    subcategory?: string;
}

/**
 * AI Generation output V2 - includes auto-categorization and E-E-A-T
 */
export interface AIGenerationOutput {
    title: string;
    seoTitle: string;
    description: string;
    seoDescription: string;
    fullText: string;
    keywords: string[];
    readingTime: number;
    // Auto-categorization (single request)
    suggestedCategory: string;
    suggestedSubcategory: string;
    // E-E-A-T fields
    sources: { title: string; url: string }[];
    factsCited: string[];
    lastVerified: string;
    // Legacy fields (optional for backward compat)
    userIntent?: string;
    competitorGap?: string;
}
