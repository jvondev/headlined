import { CATEGORIES, CategoryDefinition, KeywordDefinition } from '@scraper/categories';
import { Post } from '@/types';

/**
 * structure for return value of category determination
 */
export interface ArticleCategoryPath {
    category: string;
    subcategory: string;
    canonicalPath: string;
}

/**
 * Determine the best category and subcategory for a post.
 * Logic:
 * 1. Check strict Topic match (if post.topic exists and matches a category ID or item slug).
 * 2. Check title/content against Keyword Definitions in CATEGORIES.
 * 3. Fallback to 'news' / 'general' or similar.
 */
export function getArticleCategory(post: Post): { category: string; subcategory: string } {
    const textToScan = `${post.title} ${post.description || ''} ${post.topic || ''}`.toLowerCase();

    // Priority 1: Explicit Topic Match (often set by scraper)
    if (post.topic) {
        const topicSlug = post.topic.toLowerCase();

        // Check if topic matches a main category ID
        const mainCat = CATEGORIES.find(c => c.id === topicSlug);
        if (mainCat) {
            // If the topic is a main category, try to find a subcategory, otherwise use 'general' or first item
            return { category: mainCat.id, subcategory: mainCat.items[0]?.slug || 'general' };
        }

        // Check if topic matches a subcategory slug anywhere
        for (const cat of CATEGORIES) {
            const subItem = cat.items.find(item => item.slug === topicSlug || item.aliases.some(a => a.toLowerCase() === topicSlug));
            if (subItem) {
                return { category: cat.id, subcategory: subItem.slug };
            }
        }
    }

    // Priority 2: Keyword Scanning
    // We scan for specific aliases in the title/topic
    for (const cat of CATEGORIES) {
        for (const item of cat.items) {
            // Check aliases
            for (const alias of item.aliases) {
                const aliasLower = alias.toLowerCase();
                // Simple inclusion check - ensures we don't match inside other words if possible, but basic includes is often enough for unique names
                // Adding spaces to boundary check
                if (textToScan.includes(aliasLower)) {
                    return { category: cat.id, subcategory: item.slug };
                }
            }
        }
    }

    // Priority 3: Fallback based on "Topics" category if loosely matched
    const topicsCat = CATEGORIES.find(c => c.id === 'topics');
    if (topicsCat) {
        // ... specific logic if needed, or just default
    }

    // Absolute fallback
    return { category: 'topics', subcategory: 'world' };
}

/**
 * Generate the full canonical path for an article.
 * Format: /news/[category]/[subcategory]/[YYYY]/[MM]/[DD]/[slug]
 */
export function getArticleCanonicalPath(post: Post): string {
    if (!post.date || !post.slug) {
        // Fallback for incomplete posts
        return `/article/${post.date || 'unknown'}/${post.slug || 'unknown'}`;
    }

    const { category, subcategory } = getArticleCategory(post);

    // Parse date YYYY-MM-DD
    const [year, month, day] = post.date.split('-');

    if (!year || !month || !day) {
        return `/article/${post.date}/${post.slug}`;
    }

    return `/news/${category}/${subcategory}/${year}/${month}/${day}/${post.slug}`;
}
