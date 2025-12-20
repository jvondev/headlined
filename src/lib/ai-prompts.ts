/**
 * AI Prompts for Article Generation V2
 * Enhanced for E-E-A-T, anti-AI detection, and auto-categorization
 * All in single request to minimize API calls
 */

import { CATEGORIES } from '@scraper/categories';

// Build category list for auto-suggestion
function buildCategoryList(): string {
  return CATEGORIES.map(cat =>
    `- ${cat.id}: ${cat.items.slice(0, 5).map(i => i.slug).join(', ')}...`
  ).join('\n');
}

export const ARTICLE_GENERATION_PROMPT_V2 = `You are writing a public reference page intended to become a canonical source for the topic below.

### Writing Objective
Produce a reference-grade page that could plausibly be cited as an authoritative explanation of this topic. The page should resolve the search intent clearly, efficiently, and with high trust. This is not a blog post, not documentation, and not marketing.

### Input Data (Seed Concepts)
- Seed Primary Topic: {keyword}
- Seed Related Topics: {relatedKeywords}
- Research Context (GROUNDING DATA):
{groundingContext}

### Editorial Standards (STRICTLY FOLLOW)

1. **Search Intent Mastery**: Solve the primary search intent fully. Analyze why a "professional" or "everyday person" is searching for this and provide the solution immediately. The article must be the "final stop" for the user.
2. **Dynamic Format Selection**: Analyze the keyword and GROUNDING DATA to choose the most competitive angle. Does the reader need a step-by-step guideline? A list of the best solutions? A comparison to alternatives? Use a creative, high-value structure that logically fits the goal.
3. **Early Resolution**: State the core answer or recommendation in the first two paragraphs. No withholding for narrative effect.
4. **Canonical Authority**: Write with a professional, detached, and authoritative stance. Use a "Human-Clean" style that avoids AI-isms and robotic patterns.
5. **Topics Strategic Pivoting**: The Seed Topics are not absolute. After analyzing intent and GROUNDING DATA, you MUST re-evaluate if there are more technically accurate, high-volume, or authoritative unique angles that better resolve the query. If a specific technical term or high-intent variation has better "canonical potential," pivot the content, title, and "unique angle" field to that superior target.
6. **Fact-First causality**: Explain the "Why" and "How" behind mechanisms. Prefer causality over simple description.
7. **Linguistic Precision & Readability (STRICT COMPLIANCE)**:
   - **Tone**: Plain English. Expert but accessible. Active voice ONLY.
   - **Flesch Reading Ease**: 60-80 (use simple vocabulary, shorter words).
   - **Gunning Fog Index**: 7-12 (limit words with 3+ syllables).
   - **Flesch-Kincaid Grade**: 6-9 (suitable for a broad professional and general audience).
   - **Sentence Length**: 12-20 words average. Mix short, impactful sentences (5-10 words) with moderate ones (15-25 words) for natural rhythm.
   - **No Nominalizations**: Replace abstract nouns (e.g., "implementation of", "utilization of") with direct verbs (e.g., "implement", "use").
8. **Compression Discipline**: Every sentence must contribute new information. Eliminate filler, rhetorical questions, and hollow transitions like "In today's world."
9. **Depth without Bloat**: Use the target word count to provide granular, specific detail on mechanics, history, and real-world application. Achieve length by investigating sub-topics in the GROUNDING DATA, not by padding.
10. **Human-Clean & Citable Output**:
    - **NO** "In conclusion", "Lastly", or "In this article".
    - **NO** repetitive phrasing or stylistic crutches (limit em-dashes to 1-2 per article).
    - **DO weave research sources naturally as markdown links** (e.g., [According to the 2025 project roadmap](url)).
11. **Structural Excellence**:
    - **Minimum 1,500 words; Target 2,000 - 2,500+ words.**
    - Use 5-10 comprehensive H2 sections. Use H3 and H4 for deep hierarchy when needed.
    - Include Markdown tables or bulleted lists ONLY when they compress complex data effectively.
12. **MANDATORY FAQ Generation**: 
    - You MUST generate 3-8 high-value questions that address common user pain points or Google "People Also Ask" queries.
    - Each answer must be a concise, expert resolution (2-4 sentences).
    - **CRITICAL: The "faq" JSON field MUST be populated. DO NOT include these questions or headings anywhere in the "fullText" block.**

### Final Editorial Gate
If this page were removed from the internet, would it create a noticeable gap in understanding for this topic? If no, revise until it would.

### Auto-Categorization
Select the BEST category and subcategory from:
{categoryList}

## JSON Output Schema
{
  "title": "50-60 chars, authoritative. Reflect your pivoted/optimized keyword strategy.",
  "seoTitle": "High-CTR title optimized for your re-evaluated primary keyword",
  "description": "150-160 chars meta description",
  "seoDescription": "Varied meta description for SEO",
  "fullText": "Markdown content. 2,000+ words. Comprehensive deep-dive. DO NOT INCLUDE FAQ HERE.",
  "keywords": ["10 strategic, high-value keywords based on your pivot/intent analysis"],
  "readingTime": number,
  "userIntent": "Brief analysis of the user's primary goal.",
  "competitorGap": "What specific gap did we fill to be the definitive source?",
  "suggestedCategory": "category id from list",
  "suggestedSubcategory": "subcategory slug from list",
  "sources": [{"title": "Source Name", "url": "https://..."}],
  "factsCited": ["Specific fact 1 with source", "Specific fact 2 with source"],
  "faq": [{"question": "Demand-driven question?", "answer": "Concise, expert answer."}],
  "lastVerified": "{today}"
}

Output ONLY valid JSON. No markdown code blocks around the JSON.`;





/**
 * Build the enhanced prompt with grounding data and category list
 */
export function buildEnhancedArticlePrompt(
  keyword: string,
  relatedKeywords: string[] = [],
  groundingContext: string
): string {
  return ARTICLE_GENERATION_PROMPT_V2
    .replace('{keyword}', keyword)
    .replace('{relatedKeywords}', relatedKeywords.length > 0 ? relatedKeywords.join(', ') : 'none')
    .replace('{groundingContext}', groundingContext || 'No research data available - use your training knowledge.')
    .replace('{categoryList}', buildCategoryList())
    .replace('{today}', new Date().toISOString().split('T')[0]);
}


export const KEYWORD_EXTRACTION_PROMPT = `Extract the top 10 most relevant keywords from the following content. Return only a JSON array of strings, nothing else.

Content:
{content}

Output format: ["keyword1", "keyword2", ...]`;

export const SEO_GENERATION_PROMPT = `Generate SEO-optimized title and meta description for the following article.

Title: {title}
Content summary: {summary}
Target keyword: {keyword}

Output only valid JSON:
{
  "seoTitle": "SEO title 50-60 chars with keyword",
  "seoDescription": "Meta description 150-160 chars with keyword naturally included"
}`;
