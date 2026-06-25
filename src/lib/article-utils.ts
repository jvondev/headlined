

import { Post } from '@/types';

import { fetchAndDecompressJSON } from './client-posts';

const getReleaseUrl = (dateString: string) => {
    const year = dateString.split('-')[0];
    return `https://raw.githubusercontent.com/jvondev/headlined/data/rss-data-${year}/${dateString}.tsv.gz`;
};

/**
 * Fetch a single article by date and slug from the jsDelivr CDN.
 * Returns null if not found.
 */
export async function fetchArticleByDateAndSlug(date: string, slug: string, topicHint?: string): Promise<Post | null> {
    const datesToCheck = [
        date,
        // Check previous day (timezone behind)
        new Date(new Date(date).setDate(new Date(date).getDate() - 1)).toISOString().split('T')[0],
        // Check next day (timezone ahead)
        new Date(new Date(date).setDate(new Date(date).getDate() + 1)).toISOString().split('T')[0]
    ];

    for (const checkDate of datesToCheck) {
        try {
            // Add cache buster to bypass stale CDN/Browser cache
            const url = `${getReleaseUrl(checkDate)}?t=${Date.now()}`;
            const posts: Post[] | null = await fetchAndDecompressJSON(url);

            if (!posts) continue;

            const post = posts.find(p => p.slug === slug);

            if (post) {
                return { ...post, date: checkDate };
            }
        } catch (error) {
            console.warn(`Error fetching article for date ${checkDate}:`, error);
        }
    }

    // FALLBACK: If we have a hint where the article might be (category/subcategory)
    // and it wasn't found in the date buckets, traverse that specific bucket.
    if (topicHint) {
        return await fetchArticleBySlugAndTopic(slug, topicHint);
    }

    return null;
}

/**
 * Fetch article by searching a specific topic feed.
 * Path should be "category/subcategory" (e.g. "topics/sports")
 */
export async function fetchArticleBySlugAndTopic(slug: string, topicPath: string): Promise<Post | null> {
    try {
        // topicPath is expected to be "category/subcategory"
        // Topics endpoint is not supported in the yearly release system currently.
        // It relies entirely on the daily feed. This function is kept for fallback compatibility.
        const url = `https://github.com/jvondev/headlined/releases/download/rss-data-topics/${topicPath}.json?t=${Date.now()}`;
        const response = await fetch(url, { next: { revalidate: 60 } });
        if (!response.ok) return null;

        const posts: Post[] = await response.json();
        const post = posts.find(p => p.slug === slug);
        return post || null;
    } catch (e) {
        return null;
    }
}

/**
 * Fetch all posts for a given date (for related articles).
 */
export async function fetchPostsByDate(date: string): Promise<Post[]> {
    try {
        const url = getReleaseUrl(date);
        const posts: Post[] | null = await fetchAndDecompressJSON(url);

        if (!posts) {
            return [];
        }

        return posts.map(p => ({ ...p, date }));
    } catch (error) {
        console.error(`Error fetching posts for ${date}:`, error);
        return [];
    }
}

/**
 * Get related articles for a post (same topic, same date, excluding current).
 */
export function getRelatedArticles(currentPost: Post, allPosts: Post[], limit: number = 5): Post[] {
    const currentTopics = Array.isArray(currentPost.topic) ? currentPost.topic : (currentPost.topic ? [currentPost.topic] : []);

    const related = allPosts.filter(p => {
        if (p.slug === currentPost.slug) return false;
        const pTopics = Array.isArray(p.topic) ? p.topic : (p.topic ? [p.topic] : []);
        // Check if there is any overlap in topics
        return pTopics.some(t => currentTopics.includes(t));
    });

    // If not enough from same topic, add from any topic
    if (related.length < limit) {
        const others = allPosts.filter(p =>
            p.slug !== currentPost.slug &&
            !related.find(r => r.slug === p.slug)
        );
        related.push(...others.slice(0, limit - related.length));
    }

    return related.slice(0, limit);
}

// SEO-Safe Content Transformations
// These help differentiate aggregated content from original sources

/**
 * Transform title for SEO safety - adds context without losing meaning.
 * Uses varied prefixes to avoid pattern detection.
 */
export function transformTitleForSEO(title: string, topic?: string): string {
    // Clean any existing prefixes first
    const cleanTitle = title.replace(/^(News:|Breaking:|Update:|Report:)\s*/i, '');

    // Topic-aware transformations
    const topicPrefixes: Record<string, string[]> = {
        'tech': ['Tech Update:', 'In Tech:', 'Technology:'],
        'business': ['Business News:', 'Market Watch:', 'Industry:'],
        'politics': ['Political Update:', 'Government:', 'Policy:'],
        'sports': ['Sports:', 'Game Day:', 'Athletics:'],
        'entertainment': ['Entertainment:', 'Culture:', 'Spotlight:'],
        'world': ['Global:', 'World News:', 'International:'],
        'science': ['Science:', 'Research:', 'Discovery:'],
    };

    const defaultPrefixes = [
        'Headline:',
        'Story:',
        'Report:',
        'Coverage:',
        'Update:',
    ];

    // Use hash of title to pick consistent prefix
    const hash = cleanTitle.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    let prefixes = defaultPrefixes;
    if (topic) {
        const targetTopic = Array.isArray(topic) ? (topic.length > 0 ? topic[0] : null) : topic;
        if (targetTopic) {
            prefixes = topicPrefixes[targetTopic.toLowerCase()] || defaultPrefixes;
        }
    }
    const prefix = prefixes[hash % prefixes.length];

    return `${prefix} ${cleanTitle}`;
}

/**
 * Transform description for SEO safety - restructures and contextualizes.
 */
export function transformDescriptionForSEO(description: string, title: string): string {
    if (!description) return `Read the full story about "${title}" and get the latest updates.`;

    // Clean description
    let clean = description
        .replace(/\s+/g, ' ')
        .trim();

    // Add contextual wrapper
    const wrappers = [
        (d: string) => `This story covers: ${d}`,
        (d: string) => `Key points: ${d}`,
        (d: string) => `Summary: ${d}`,
        (d: string) => `What you need to know: ${d}`,
        (d: string) => `The latest: ${d}`,
    ];

    // Pick wrapper based on hash
    const hash = clean.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const wrapper = wrappers[hash % wrappers.length];

    const transformed = wrapper(clean);

    // Ensure proper length for meta description (150-160 chars)
    if (transformed.length > 155) {
        return transformed.substring(0, 152) + '...';
    }

    return transformed;
}

/**
 * Generate a unique, SEO-friendly meta description.
 */
export function generateMetaDescription(post: Post): string {
    const parts: string[] = [];

    // Add topic context
    if (post.topic) {
        const topicStr = Array.isArray(post.topic)
            ? (post.topic.length > 0 ? post.topic[0] : "")
            : post.topic;
        if (topicStr) {
            parts.push(`[${topicStr.toUpperCase()}]`);
        }
    }

    // Add date context
    if (post.date) {
        const dateObj = new Date(post.date);
        parts.push(dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    }

    // Add description
    const desc = post.description || post.title;
    parts.push('-');
    parts.push(desc);

    const result = parts.join(' ');

    // Truncate for optimal meta description length
    if (result.length > 155) {
        return result.substring(0, 152) + '...';
    }

    return result;
}
