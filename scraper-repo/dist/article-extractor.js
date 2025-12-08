"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractArticle = extractArticle;
exports.fetchAndExtract = fetchAndExtract;
const node_html_parser_1 = require("node-html-parser");
// Noise selectors to remove before extraction
const NOISE_SELECTORS = [
    'script', 'style', 'noscript', 'iframe', 'svg', 'canvas',
    'nav', 'header', 'footer', 'aside', 'form',
    '.ad', '.ads', '.advertisement', '.promo', '.promotion',
    '.cta', '.call-to-action', '.subscribe', '.newsletter',
    '.social-share', '.share-buttons', '.comments', '.comment-section',
    '.related-posts', '.related-articles', '.sidebar', '.widget',
    '[class*="ad-"]', '[class*="advertisement"]', '[class*="sponsor"]',
    '[id*="ad-"]', '[id*="advertisement"]', '[id*="sponsor"]',
    '[class*="newsletter"]', '[class*="subscribe"]', '[class*="popup"]',
    '[class*="modal"]', '[class*="cookie"]', '[class*="gdpr"]',
    '[role="banner"]', '[role="navigation"]', '[role="complementary"]',
    '[aria-hidden="true"]'
];
// Content container selectors (priority order)
const CONTENT_SELECTORS = [
    'article[class*="content"]',
    'article[class*="article"]',
    'article[class*="post"]',
    'article',
    '[role="main"] article',
    '[role="main"]',
    'main article',
    'main',
    '.article-body',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.story-body',
    '.story-content',
    '.content-body',
    '.body-content',
    '[class*="articleBody"]',
    '[class*="article-body"]',
    '[itemprop="articleBody"]',
    '.caas-body', // Yahoo
    '.article__body-content', // BBC
];
// CTA and promotional patterns to remove
const CTA_PATTERNS = [
    /subscribe\s+(to|for|now|today|here).*?[.!?\n]/gi,
    /sign\s*up\s+(for|to|now|today|here).*?[.!?\n]/gi,
    /follow\s+us\s+on.*?[.!?\n]/gi,
    /join\s+(our|the)\s+(newsletter|mailing list).*?[.!?\n]/gi,
    /click\s+here\s+to.*?[.!?\n]/gi,
    /read\s+more\s*(at|on|:).*?$/gim,
    /continue\s+reading\s*(at|on)?.*?$/gim,
    /for\s+more\s+(information|details|news).*?$/gim,
    /download\s+(our|the)\s+app.*?[.!?\n]/gi,
    /get\s+the\s+(full|complete)\s+story.*?$/gim,
    /share\s+this\s+(article|story|post).*?$/gim,
    /\[.*?read\s+more.*?\]/gi,
    /\(source:.*?\)/gi,
    /source:\s*\w+.*?$/gim,
];
// Metadata patterns to remove
const METADATA_PATTERNS = [
    /^(by|written\s+by|author:)\s+.+$/gim,
    /^(published|updated|posted)(\s+on)?:?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}.*$/gim,
    /^\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s*$/gm,
    /^\s*\d+\s*(min|minute|hour)s?\s*(read|ago)\s*$/gim,
    /^\s*(©|copyright|\(c\)).*$/gim,
    /^\s*all\s+rights\s+reserved.*$/gim,
    /^\s*photo\s*(by|credit|courtesy).*$/gim,
    /^\s*image\s*(by|credit|courtesy).*$/gim,
    /^\s*getty\s+images?.*$/gim,
    /^\s*reuters.*$/gim,
    /^\s*associated\s+press.*$/gim,
    /^\s*afp.*$/gim,
];
// Stopwords for keyword extraction
const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what',
    'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
    'now', 'here', 'there', 'then', 'once', 'if', 'new', 'said', 'says', 'like',
    'one', 'two', 'first', 'many', 'year', 'years', 'time', 'people', 'way', 'day',
]);
/**
 * Main extraction function - extracts article content from HTML
 */
function extractArticle(html, url) {
    try {
        const root = (0, node_html_parser_1.parse)(html, {
            blockTextElements: {
                script: false,
                noscript: false,
                style: false,
                pre: true,
            }
        });
        // Step 1: Try JSON-LD extraction (most accurate)
        const jsonLdContent = extractFromJsonLd(root);
        if (jsonLdContent && jsonLdContent.length > 200) {
            const cleaned = cleanContent(jsonLdContent);
            return buildResult(cleaned, 1.0); // Perfect quality score for JSON-LD
        }
        // Step 2: Remove noise elements
        removeNoiseElements(root);
        // Step 3: Score and select best content container
        const content = findBestContentContainer(root);
        if (!content) {
            return buildResult(null, 0);
        }
        // Step 4: Clean and return
        const cleaned = cleanContent(content);
        const qualityScore = calculateQualityScore(cleaned);
        return buildResult(cleaned, qualityScore);
    }
    catch (error) {
        return buildResult(null, 0);
    }
}
/**
 * Extract article body from JSON-LD structured data
 */
function extractFromJsonLd(root) {
    const scripts = root.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const content = script.textContent;
            if (!content)
                continue;
            const data = JSON.parse(content);
            const articles = Array.isArray(data) ? data : [data];
            for (const item of articles) {
                // Check for NewsArticle, Article, BlogPosting schemas
                if (item['@type'] &&
                    ['NewsArticle', 'Article', 'BlogPosting', 'WebPage'].includes(item['@type'])) {
                    if (item.articleBody) {
                        return item.articleBody;
                    }
                    if (item.text) {
                        return item.text;
                    }
                }
                // Check for @graph structure
                if (item['@graph'] && Array.isArray(item['@graph'])) {
                    for (const graphItem of item['@graph']) {
                        if (graphItem.articleBody) {
                            return graphItem.articleBody;
                        }
                    }
                }
            }
        }
        catch {
            // Invalid JSON, continue to next script
        }
    }
    return null;
}
/**
 * Remove noise elements from DOM
 */
function removeNoiseElements(root) {
    for (const selector of NOISE_SELECTORS) {
        try {
            const elements = root.querySelectorAll(selector);
            for (const el of elements) {
                el.remove();
            }
        }
        catch {
            // Invalid selector, skip
        }
    }
}
/**
 * Find the best content container using heuristic scoring
 */
function findBestContentContainer(root) {
    // Try priority selectors first
    for (const selector of CONTENT_SELECTORS) {
        try {
            const el = root.querySelector(selector);
            if (el) {
                const text = el.textContent.trim();
                if (text.length > 300) {
                    return text;
                }
            }
        }
        catch {
            // Invalid selector
        }
    }
    // Fallback: Score all candidate containers
    const candidates = root.querySelectorAll('div, section, article, main');
    let bestScore = 0;
    let bestContent = null;
    for (const candidate of candidates) {
        const score = scoreContainer(candidate);
        if (score > bestScore) {
            bestScore = score;
            bestContent = candidate.textContent.trim();
        }
    }
    // Final fallback: All paragraphs
    if (!bestContent || bestContent.length < 200) {
        const paragraphs = root.querySelectorAll('p');
        const pTexts = paragraphs
            .map(p => p.textContent.trim())
            .filter(t => t.length > 40);
        if (pTexts.length > 0) {
            bestContent = pTexts.join('\n\n');
        }
    }
    return bestContent;
}
/**
 * Score a container element based on content heuristics
 */
function scoreContainer(element) {
    const text = element.textContent.trim();
    const html = element.innerHTML;
    if (text.length < 100)
        return 0;
    let score = 0;
    // Text length (max 40 points)
    score += Math.min(text.length / 100, 40);
    // Paragraph count (max 30 points)
    const paragraphs = element.querySelectorAll('p');
    score += Math.min(paragraphs.length * 3, 30);
    // Text density: ratio of text to HTML (max 20 points)
    const textDensity = text.length / Math.max(html.length, 1);
    score += textDensity * 40; // Higher density = better
    // Link density penalty (negative score for nav-heavy content)
    const links = element.querySelectorAll('a');
    const linkText = links.map(a => a.textContent).join('').length;
    const linkDensity = linkText / Math.max(text.length, 1);
    score -= linkDensity * 30; // High link density = bad
    // Bonus for semantic class/id names
    const classId = (element.getAttribute('class') || '') + (element.getAttribute('id') || '');
    if (/content|article|body|story|entry|post/i.test(classId)) {
        score += 15;
    }
    if (/sidebar|widget|ad|promo|nav|footer|header/i.test(classId)) {
        score -= 20;
    }
    return score;
}
/**
 * Clean extracted content by removing CTAs, metadata, and normalizing
 */
function cleanContent(text) {
    if (!text)
        return null;
    let cleaned = text;
    // Remove CTA patterns
    for (const pattern of CTA_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }
    // Remove metadata patterns
    for (const pattern of METADATA_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }
    // Normalize whitespace
    cleaned = cleaned
        .replace(/\t+/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+$/gm, '')
        .trim();
    // Validate minimum content
    if (cleaned.length < 100)
        return null;
    return cleaned;
}
/**
 * Calculate quality score based on content characteristics
 */
function calculateQualityScore(text) {
    if (!text)
        return 0;
    let score = 0;
    // Length score (0-0.3)
    if (text.length >= 500)
        score += 0.15;
    if (text.length >= 1000)
        score += 0.1;
    if (text.length >= 2000)
        score += 0.05;
    // Sentence structure (0-0.3)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length >= 5)
        score += 0.1;
    if (sentences.length >= 10)
        score += 0.1;
    if (sentences.length >= 20)
        score += 0.1;
    // Paragraph structure (0-0.2)
    const paragraphs = text.split(/\n\n+/);
    if (paragraphs.length >= 2)
        score += 0.1;
    if (paragraphs.length >= 5)
        score += 0.1;
    // Average sentence length check (0-0.2)
    const avgSentenceLength = sentences.length > 0
        ? text.length / sentences.length
        : 0;
    if (avgSentenceLength >= 50 && avgSentenceLength <= 200) {
        score += 0.2; // Good sentence length
    }
    return Math.min(score, 1.0);
}
/**
 * Calculate reading time in minutes (assuming 200 wpm)
 */
function calculateReadingTime(text) {
    if (!text)
        return 0;
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}
/**
 * Extract top keywords by frequency
 */
function extractKeywords(text, topN = 10) {
    if (!text)
        return [];
    // Tokenize and clean
    const words = text
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOPWORDS.has(w));
    // Count frequency
    const freq = {};
    for (const word of words) {
        freq[word] = (freq[word] || 0) + 1;
    }
    // Sort by frequency and return top N
    return Object.entries(freq)
        .filter(([_, count]) => count >= 2) // At least 2 occurrences
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([word]) => word);
}
/**
 * Build the extraction result
 */
function buildResult(fullText, qualityScore) {
    return {
        fullText,
        readingTime: calculateReadingTime(fullText),
        keywords: extractKeywords(fullText),
        qualityScore: Math.round(qualityScore * 100) / 100,
    };
}
/**
 * Fetch and extract article with retry logic
 */
async function fetchAndExtract(url, retries = 3, timeout = 15000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout + attempt * 5000);
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
                    'Accept': 'text/html,application/xhtml+xml',
                }
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const html = await response.text();
            return extractArticle(html, url);
        }
        catch (error) {
            if (attempt < retries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
            }
        }
    }
    return buildResult(null, 0);
}
