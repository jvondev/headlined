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
}

/**
 * Article storage structure
 */
export interface ArticleStorage {
    version: number;
    articles: InternalArticle[];
}

/**
 * AI Generation input
 */
export interface AIGenerationInput {
    keyword: string;
    relatedKeywords?: string[];
    category: string;
    subcategory: string;
}

/**
 * AI Generation output
 */
export interface AIGenerationOutput {
    title: string;
    seoTitle: string;
    description: string;
    seoDescription: string;
    fullText: string;
    keywords: string[];
    readingTime: number;
    userIntent: string;
    competitorGap: string;
}
