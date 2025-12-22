
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { buildEnhancedArticlePrompt, KEYWORD_EXTRACTION_PROMPT, SEO_GENERATION_PROMPT } from './ai-prompts';
import { gatherGroundingData, formatGroundingContext } from './data-grounding';
import { AIGenerationInput, AIGenerationOutput } from '@/types/article';

// Model Configuration
const PRIMARY_MODEL = 'googleai/gemini-3-flash-preview';
const FALLBACK_MODEL = 'googleai/gemini-2.5-flash';

// Initialize Genkit with Google AI plugin
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Warning: GOOGLE_GENAI_API_KEY is not defined in environment variables.');
}

const ai = genkit({
    plugins: [googleAI({ apiKey })]
});

/**
 * Robust generation helper with fallback logic
 */
async function generateWithFallback(options: any) {
    try {
        console.log(`🤖 Attempting generation with ${PRIMARY_MODEL}...`);
        return await ai.generate({
            ...options,
            model: PRIMARY_MODEL,
        });
    } catch (error) {
        console.warn(`⚠️ ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}...`);
        console.error('Error detail:', error);
        return await ai.generate({
            ...options,
            model: FALLBACK_MODEL,
        });
    }
}

/**
 * Helper to clean AI response and parse JSON
 */
function cleanAndParseJSON(text: string): any {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
}

/**
 * Generate article with enhanced E-E-A-T prompt and free data grounding
 * Single request includes: grounding data, content generation, and auto-categorization
 */
export async function generateEnhancedArticle(
    keyword: string,
    relatedKeywords: string[] = []
): Promise<AIGenerationOutput> {
    console.log('🚀 Starting enhanced generation for:', keyword);

    // Step 1: Gather grounding data with a combined query for 1-request efficiency
    console.log('📡 Fetching grounding data...');
    const groundingQuery = keyword;

    const groundingData = await gatherGroundingData(groundingQuery);
    const groundingContext = await formatGroundingContext(groundingData);
    console.log(`✅ Got ${groundingData.serpResults.length} SERP results, wiki: ${!!groundingData.wikiSummary}`);

    // Step 2: Build enhanced prompt with all data
    // Internal Linking Injection (Internal Articles + Static Cache)
    let internalLinksContext = '';
    const MAX_TOTAL_LINKS = 10;

    try {
        const potentialLinks: any[] = [];
        const queryTokens = keyword.toLowerCase().split(' ');

        // 1. Get Internal Articles
        try {
            const articlesData = await import('@/data/internal-articles/articles.json');
            const articles = articlesData.articles || [];
            potentialLinks.push(...articles.map((a: any) => ({
                ...a,
                sourceType: 'internal',
                url: `/article/${a.category}/${a.subcategory}/${a.slug}`
            })));
        } catch (e) {
            console.warn('Failed to load internal articles', e);
        }

        // 2. Get Static Cache Data (limited scan)
        try {
            const targetTopics = ['tech', 'business', 'finance', 'science', 'health', 'politics', 'world', 'sports'];

            for (const topic of targetTopics) {
                try {
                    const topicData = await import(`@/data/static-cache/topics/${topic}.json`).then(m => m.default || m).catch(() => []);

                    potentialLinks.push(...topicData.map((item: any) => {
                        const date = new Date(item.created_at || new Date());
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        const cat = 'news';
                        const sub = item.topic ? item.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'updates';

                        return {
                            ...item,
                            sourceType: 'news',
                            url: `/news/${cat}/${sub}/${yyyy}/${mm}/${dd}/${item.slug}`
                        };
                    }));
                } catch (err) {
                    // ignore missing files
                }
            }

        } catch (e) {
            console.warn('Failed to load static cache data', e);
        }

        // 3. Score and Filter
        const relevantLinks = potentialLinks.filter((item: any) => {
            if (!item.title) return false;
            // Keywords check
            const itemKeywords = item.keywords || [];
            const textToSearch = (item.title + ' ' + (item.description || '')).toLowerCase();

            // Relevancy Score (Simple)
            let score = 0;
            if (textToSearch.includes(keyword.toLowerCase())) score += 10;

            queryTokens.forEach(token => {
                if (token.length > 3 && textToSearch.includes(token)) score += 2;
                if (itemKeywords.some((k: string) => k.toLowerCase().includes(token))) score += 3;
            });

            (item as any).score = score;
            return score > 2; // Threshold
        }).sort((a: any, b: any) => b.score - a.score)
            .slice(0, MAX_TOTAL_LINKS);

        if (relevantLinks.length > 0) {
            internalLinksContext = relevantLinks.map((a: any) =>
                `- ${a.title} (Type: ${a.sourceType}, URL: ${a.url})`
            ).join('\n');
            console.log(`🔗 Found ${relevantLinks.length} relevant internal/news links.`);
        }
    } catch (e) {
        console.warn('Failed to load internal links context in ai-service', e);
    }

    const prompt = buildEnhancedArticlePrompt(keyword, relatedKeywords, groundingContext, internalLinksContext);

    // Step 3: Generate with Fallback Logic
    const { text } = await generateWithFallback({
        prompt,
        config: {
            temperature: 0.8,
            maxOutputTokens: 12288, // Increased to support 2500+ words
        },
    });

    try {
        const result = cleanAndParseJSON(text);
        console.log('✅ Generated successfully:', result.title);

        // Merge grounding sources if AI didn't include them
        if (!result.sources || result.sources.length === 0) {
            result.sources = groundingData.sources;
        }

        return result as AIGenerationOutput;
    } catch (e) {
        console.error('Failed to parse AI response:', text.slice(0, 500));
        throw new Error('Failed to parse AI response as JSON');
    }
}

/**
 * Generation function - now exclusively uses enhanced V2 generation
 */
export async function generateArticleContent(
    input: AIGenerationInput
): Promise<AIGenerationOutput> {
    return generateEnhancedArticle(input.keyword, input.relatedKeywords);
}

/**
 * Extract keywords from content using AI
 */
export async function extractKeywords(content: string): Promise<string[]> {
    const prompt = KEYWORD_EXTRACTION_PROMPT.replace('{content}', content.slice(0, 2000));

    const { text } = await generateWithFallback({
        prompt,
        config: {
            temperature: 0.3,
            maxOutputTokens: 256,
        },
    });

    try {
        return cleanAndParseJSON(text);
    } catch {
        return [];
    }
}

/**
 * Generate SEO title and description for an article
 */
export async function generateSEO(
    title: string,
    summary: string,
    keyword: string
): Promise<{ seoTitle: string; seoDescription: string }> {
    const prompt = SEO_GENERATION_PROMPT
        .replace('{title}', title)
        .replace('{summary}', summary.slice(0, 500))
        .replace('{keyword}', keyword);

    const { text } = await generateWithFallback({
        prompt,
        config: {
            temperature: 0.5,
            maxOutputTokens: 256,
        },
    });

    try {
        return cleanAndParseJSON(text);
    } catch {
        return { seoTitle: title, seoDescription: summary.slice(0, 160) };
    }
}
