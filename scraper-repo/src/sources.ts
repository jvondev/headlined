// ============================================================================
// TOPIC MAPPING - Centralized URL-to-topic configuration
// Easy to maintain and extend for new sources
// ============================================================================

export interface TopicRule {
    pattern: string | RegExp;  // URL pattern to match
    topic: string;             // Topic to assign
}

export interface SourceConfig {
    name: string;
    url: string;
    defaultTopic: string;
    topicRules?: TopicRule[];  // Optional URL-based topic overrides
}

// ============================================================================
// CENTRALIZED TOPIC RULES
// Add new URL patterns here to categorize content
// ============================================================================

// Global URL patterns that apply across ALL sources
export const GLOBAL_TOPIC_RULES: TopicRule[] = [
    // Finance/Business
    { pattern: /finance\.|\/finance\//i, topic: 'finance' },
    { pattern: /money\.|\/money\//i, topic: 'finance' },
    { pattern: /markets?\.|\/markets?\//i, topic: 'finance' },
    { pattern: /invest(ing|ment)?\.|\/invest/i, topic: 'finance' },
    { pattern: /stock|crypto|bitcoin|ethereum/i, topic: 'finance' },

    // Tech
    { pattern: /tech\.|\/tech\//i, topic: 'tech' },
    { pattern: /technology\.|\/technology\//i, topic: 'tech' },
    { pattern: /gadget|software|hardware|developer/i, topic: 'tech' },
    { pattern: /ai\.|\/ai\/|artificial.?intelligence/i, topic: 'tech' },

    // Auto
    { pattern: /auto\.|\/auto\//i, topic: 'auto' },
    { pattern: /cars?\.|\/cars?\//i, topic: 'auto' },
    { pattern: /vehicle|automotive|motor/i, topic: 'auto' },

    // Health
    { pattern: /health\.|\/health\//i, topic: 'health' },
    { pattern: /medical|medicine|wellness|fitness/i, topic: 'health' },

    // Sports
    { pattern: /sports?\.|\/sports?\//i, topic: 'sports' },
    { pattern: /nfl|nba|mlb|nhl|soccer|football|basketball/i, topic: 'sports' },
    { pattern: /espn\.|bleacher/i, topic: 'sports' },

    // Gaming
    { pattern: /games?\.|\/games?\//i, topic: 'gaming' },
    { pattern: /gaming|playstation|xbox|nintendo/i, topic: 'gaming' },

    // Science
    { pattern: /science\.|\/science\//i, topic: 'science' },
    { pattern: /research|study|scientific/i, topic: 'science' },

    // Politics
    { pattern: /politic|government|election|congress|senate/i, topic: 'politic' },

    // Entertainment
    { pattern: /entertainment\.|\/entertainment\//i, topic: 'entertainment' },
    { pattern: /celebrity|movie|film|music|tv\./i, topic: 'entertainment' },

    // Business
    { pattern: /business\.|\/business\//i, topic: 'business' },
];

// ============================================================================
// SOURCE-SPECIFIC OVERRIDES
// For sources with complex subdomain structures
// ============================================================================

export const SOURCE_TOPIC_OVERRIDES: Record<string, TopicRule[]> = {
    // Yahoo subdomains
    'yahoo': [
        { pattern: /finance\.yahoo\.com/i, topic: 'finance' },
        { pattern: /sports\.yahoo\.com/i, topic: 'sports' },
        { pattern: /autos\.yahoo\.com/i, topic: 'auto' },
        { pattern: /tech\.yahoo\.com/i, topic: 'tech' },
        { pattern: /health\.yahoo\.com/i, topic: 'health' },
        { pattern: /news\.yahoo\.com/i, topic: 'news' },
        { pattern: /entertainment\.yahoo\.com/i, topic: 'entertainment' },
    ],

    // Slashdot subdomains
    'slashdot': [
        { pattern: /it\.slashdot\.org/i, topic: 'tech' },
        { pattern: /tech\.slashdot\.org/i, topic: 'tech' },
        { pattern: /hardware\.slashdot\.org/i, topic: 'tech' },
        { pattern: /developers\.slashdot\.org/i, topic: 'tech' },
        { pattern: /science\.slashdot\.org/i, topic: 'science' },
        { pattern: /games\.slashdot\.org/i, topic: 'gaming' },
        { pattern: /yro\.slashdot\.org/i, topic: 'news' },
        { pattern: /books\.slashdot\.org/i, topic: 'news' },
    ],

    // Hacker News
    'hnrss': [
        { pattern: /jobs/i, topic: 'jobs' },
    ],

    // Add more source-specific rules here...
};

// ============================================================================
// TOPIC RESOLVER FUNCTION
// Use this in job.ts to determine topic from URL
// ============================================================================

/**
 * Resolve topic from URL using centralized rules
 * @param url - The article URL
 * @param sourceName - The source name (for source-specific overrides)
 * @param defaultTopic - Fallback topic if no match
 */
export function resolveTopicFromUrl(
    url: string,
    sourceName: string,
    defaultTopic: string
): string {
    // 1. Check source-specific overrides first (highest priority)
    const sourceKey = Object.keys(SOURCE_TOPIC_OVERRIDES).find(
        key => sourceName.toLowerCase().includes(key.toLowerCase())
    );

    if (sourceKey) {
        const sourceRules = SOURCE_TOPIC_OVERRIDES[sourceKey];
        for (const rule of sourceRules) {
            const pattern = typeof rule.pattern === 'string'
                ? new RegExp(rule.pattern, 'i')
                : rule.pattern;
            if (pattern.test(url)) {
                return rule.topic;
            }
        }
    }

    // 2. Check global URL patterns
    for (const rule of GLOBAL_TOPIC_RULES) {
        const pattern = typeof rule.pattern === 'string'
            ? new RegExp(rule.pattern, 'i')
            : rule.pattern;
        if (pattern.test(url)) {
            return rule.topic;
        }
    }

    // 3. Return default topic
    return defaultTopic;
}

// ============================================================================
// RSS SOURCES CONFIGURATION
// Simple source list - topics are now resolved via URL patterns
// ============================================================================

export interface Source {
    name: string;
    url: string;
    topic: string;  // Default topic (used when URL patterns don't match)
}

export const sourcesData: Source[] = [
    { name: "Yahoo News", url: "https://news.yahoo.com/rss/", topic: "news" },
    { name: "Hacker News", url: "https://hnrss.org/newest.atom", topic: "tech" },
    { name: "Slashdot", url: "https://rss.slashdot.org/Slashdot/slashdot", topic: "news" },
    { name: "Bloomberg Markets", url: "https://feeds.bloomberg.com/markets/news.rss", topic: "finance" },
    { name: "MarketWatch Top Stories", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", topic: "finance" },
    { name: "Investing.com News", url: "https://www.investing.com/rss/news.rss", topic: "finance" },
    { name: "HNRSS Jobs", url: "https://hnrss.org/jobs.atom", topic: "jobs" },
    { name: "The Guardian Tech", url: "https://www.theguardian.com/uk/technology/rss", topic: "tech" },
    { name: "Washington Post World", url: "https://feeds.washingtonpost.com/rss/world", topic: "news" },
    { name: "Yahoo Sports", url: "https://sports.yahoo.com/rss/", topic: "sports" },
    { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", topic: "sports" },
    { name: "Lifehacker", url: "https://lifehacker.com/feed/rss", topic: "tech" },
    { name: "Harvard Business Review", url: "http://feeds.harvardbusiness.org/harvardbusiness/", topic: "business" },
    { name: "Business Insider", url: "https://feeds2.feedburner.com/businessinsider", topic: "finance" },
    { name: "Fortune", url: "http://fortune.com/feed/fortune-feeds/?id=3230629", topic: "business" },
    { name: "The Nation", url: "https://www.thenation.com/feed/?post_type=article", topic: "politic" },
    { name: "GameSpot", url: "https://www.gamespot.com/feeds/mashup/", topic: "gaming" },
];
