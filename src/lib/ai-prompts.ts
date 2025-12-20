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
- Seed Primary Keyword: {keyword}
- Seed Related Keywords: {relatedKeywords}
- Research Context (GROUNDING DATA):
{groundingContext}

### Editorial Standards (STRICTLY FOLLOW)

1. **Early Resolution**: State the correct general answer immediately. If a conclusion applies under typical conditions, make it explicit in the first two paragraphs. No withholding for narrative effect.
2. **Keyword Strategic Pivoting**: The Seed Keywords are not absolute. After analyzing the user intent and GROUNDING DATA, you MUST re-evaluate if there are more technically accurate, high-volume, or authoritative terms that better resolve the query. If a specific technical term or high-intent variation has better "canonical potential," pivot the content, title, and "keywords" field to that superior target.
3. **Intent Dominance**: Solve the primary search intent fully. Assume the reader is searching for a reliable answer and will leave once satisfied. Optimize for resolution, not engagement. The article must be the "final stop" for the user.
4. **Canonical Clarity**: Write as if this page could be cited by articles, tools, or knowledge bases. Avoid personal voice, persuasion, or speculation. 
4. **Scope Control**: Answer the primary question only. Do not broaden the topic, speculate on future-proof trends, or introduce secondary topics unless they are essential for context.
5. **Fact-First Authority**: State facts directly. Explain mechanisms, behaviors, or observable bases (causality) behind limits and ranges. Prefer causality over description.
6. **Reference Elements**: Include structural elements (tables, concise clarification sections, or short FAQ blocks) ONLY if they reduce ambiguity or compress information more clearly than prose. Do not add elements for "completeness" or SEO appearance.
7. **Linguistic Precision & Readability**:
   - **Targets**: Flesch 60-80 | Fog 7-12 | FK Grade 6-9.
   - **Sentence Length**: 12-20 words average (VARY length naturally to avoid monotony).
   - **Active Voice**: Strictly avoid passive constructions.
   - **Concrete over Abstract**: Replace abstract nouns with concrete terms.
8. **Compression Discipline**: Every sentence must contribute new information. Remove filler and rhetorical transitions, but **do not sacrifice depth for brevity**. Use the full word count to provide exhaustive, granular detail on mechanics, history, and technical specifics. Avoid repeating the conclusion.
9. **Human-Clean & Citable Output**:
   - **NO** "In conclusion", "In this article", or "In the ever-evolving landscape".
   - **NO** repetitive phrasing or stylistic crutches (limit em-dashes to 1-2 per article).
   - **DO weave research sources naturally into the text as markdown links** (e.g., [According to the 2025 project roadmap](url)). Avoid robotic bracketed citations like [1].
10. **Length & Structural Expansion for fullText (STRICT)**:
    - **Minimum 1,000 words; Target 2,000 - 2,500+ words.**
    - **Force Depth**: You MUST include at least 4-8 comprehensive H2 sections (use h3 if needed). 
    - **VARY PARAGRAPH COUNTS**: Do not use rigid symmetry. Some h2 and h3 should be thick, others lean.
    - **VARY SENTENCE COUNTS**: Do not use rigid symmetry. Some paragraph should be thick, others lean.
    - **No Padding**: achieve length by investigating the "Why" and "How" of every sub-topic in the GROUNDING DATA. If the data is sparse, use your internal knowledge to provide the necessary technical context and background.
11. **Strategic FAQ Generation**: 
    - Generate a list of "Frequently Asked Questions" that addresses high-demand search queries and common user pain points identified in research.
    - Adjust the count of FAQs (typically 3-8) based on the article's complexity. Don't force a count; prioritize high-value questions.
    - Ensure each answer is concise (2-4 sentences) and highly informative.
    - **STRICT: DO NOT include the FAQ section or FAQ heading within the "fullText" field. Use ONLY the "faq" JSON field for this content.**

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

/**
 * Legacy prompts for backward compatibility
 */
export const ARTICLE_GENERATION_PROMPT = `You are generating a canonical reference page. Output structured JSON only.

## Input
- Primary Keyword: {keyword}
- Related Keywords: {relatedKeywords}
- Target Category: {category}
- Target Subcategory: {subcategory}

## Output Requirements
- State the answer early
- Every sentence must add information
- Vary sentence length (12-20 words avg)
- Use Flesch Reading Ease 60-80

## JSON Output Schema
{
  "title": "Concise, SEO-optimized title (50-60 chars)",
  "seoTitle": "Title with primary keyword for meta tag",
  "description": "Meta description summarizing content (150-160 chars)",
  "seoDescription": "Description with keyword naturally included",
  "fullText": "Complete article in markdown format.",
  "keywords": ["array", "of", "10", "relevant", "keywords"],
  "readingTime": 5,
  "userIntent": "Brief description of what the user is trying to accomplish",
  "competitorGap": "What this article provides that typical search results don't"
}

Output ONLY valid JSON.`;

export function buildArticlePrompt(
  keyword: string,
  relatedKeywords: string[] = [],
  category: string,
  subcategory: string
): string {
  return ARTICLE_GENERATION_PROMPT
    .replace('{keyword}', keyword)
    .replace('{relatedKeywords}', relatedKeywords.length > 0 ? relatedKeywords.join(', ') : 'none')
    .replace('{category}', category)
    .replace('{subcategory}', subcategory);
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
