'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { buildEnhancedArticlePrompt, buildArticlePrompt, KEYWORD_EXTRACTION_PROMPT, SEO_GENERATION_PROMPT } from './ai-prompts';
import { gatherGroundingData, formatGroundingContext } from './data-grounding';
import { AIGenerationInput, AIGenerationOutput } from '@/types/article';

// User preference: Gemini 2.5 Flash
const MODEL_ID = 'googleai/gemini-2.5-flash';

// Initialize Genkit with Google AI plugin
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Warning: GOOGLE_GENAI_API_KEY is not defined in environment variables.');
}

const ai = genkit({
    plugins: [googleAI({ apiKey })]
});

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
    const groundingQuery = relatedKeywords.length > 0
        ? `${keyword} ${relatedKeywords.slice(0, 3).join(' ')}`
        : keyword;

    const groundingData = await gatherGroundingData(groundingQuery);
    const groundingContext = await formatGroundingContext(groundingData);
    console.log(`✅ Got ${groundingData.serpResults.length} SERP results, wiki: ${!!groundingData.wikiSummary}`);

    // Step 2: Build enhanced prompt with all data
    const prompt = buildEnhancedArticlePrompt(keyword, relatedKeywords, groundingContext);

    // Step 3: Generate with Gemini (single call includes auto-categorization)
    console.log('🤖 Generating with Gemini 2.5 Flash...');
    const { text } = await ai.generate({
        model: MODEL_ID,
        prompt,
        config: {
            temperature: 0.8, // Slightly higher for more human-like variation
            maxOutputTokens: 8192, // More room for detailed content
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
 * Legacy generation function (backward compatible)
 */
export async function generateArticleContent(
    input: AIGenerationInput
): Promise<AIGenerationOutput> {
    // If no category provided, use enhanced generation with auto-categorization
    if (!input.category || !input.subcategory) {
        return generateEnhancedArticle(input.keyword, input.relatedKeywords);
    }

    // Legacy path with explicit category
    const prompt = buildArticlePrompt(
        input.keyword,
        input.relatedKeywords || [],
        input.category,
        input.subcategory
    );

    const { text } = await ai.generate({
        model: MODEL_ID,
        prompt,
        config: {
            temperature: 0.7,
            maxOutputTokens: 4096,
        },
    });

    try {
        const result = cleanAndParseJSON(text);
        // Add default values for new fields
        return {
            ...result,
            suggestedCategory: input.category,
            suggestedSubcategory: input.subcategory,
            sources: result.sources || [],
            factsCited: result.factsCited || [],
            lastVerified: new Date().toISOString().split('T')[0],
        } as AIGenerationOutput;
    } catch (e) {
        console.error('Failed to parse AI response:', text);
        throw new Error('Failed to parse AI response as JSON');
    }
}

/**
 * Extract keywords from content using AI
 */
export async function extractKeywords(content: string): Promise<string[]> {
    const prompt = KEYWORD_EXTRACTION_PROMPT.replace('{content}', content.slice(0, 2000));

    const { text } = await ai.generate({
        model: MODEL_ID,
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

    const { text } = await ai.generate({
        model: MODEL_ID,
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
