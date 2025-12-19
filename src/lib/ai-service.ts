'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { buildArticlePrompt, KEYWORD_EXTRACTION_PROMPT, SEO_GENERATION_PROMPT } from './ai-prompts';
import { AIGenerationInput, AIGenerationOutput } from '@/types/article';

// Updated to use the latest high-performance model
// User preference: Gemini 2.5 Flash
const MODEL_ID = 'googleai/gemini-2.5-flash';



// Initialize Genkit with Google AI plugin
// Explicitly check for API key to provide better error messages
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Warning: GOOGLE_GENAI_API_KEY is not defined in environment variables.');
}

const ai = genkit({
    plugins: [
        googleAI({ apiKey }) // Pass apiKey explicitly if process.env is unstable
    ]
});


/**
 * Generate a complete article from keywords using Gemini AI
 */
export async function generateArticleContent(
    input: AIGenerationInput
): Promise<AIGenerationOutput> {
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

    // Clean the response - remove any markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    }
    if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    try {
        return JSON.parse(cleanedText) as AIGenerationOutput;
    } catch (e) {
        console.error('Failed to parse AI response:', cleanedText);
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
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        return JSON.parse(cleanedText.trim());
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
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        return JSON.parse(cleanedText.trim());
    } catch {
        return { seoTitle: title, seoDescription: summary.slice(0, 160) };
    }
}
