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

export const ARTICLE_GENERATION_PROMPT_V2 = `You are a strategic content architect and senior reference editor. Your goal is to produce a canonical reference page that dominates search results (Rank #1) by solving the user's intent with absolute authority.

## Strategic Analysis Phase
Before writing, analyze:
1. **User Intent**: What is the searcher trying to accomplish? (Informational, Transactional, Navigational).
2. **User Background**: Is the reader a novice, professional, or researcher? Adjust depth accordingly.
3. **Competitor Gap**: Based on GROUNDING DATA, what do existing results miss or oversimplify?
4. **Resolution Path**: How can we provide the definitive, "last-click" answer? Choose an angle that addresses high search volume demand with a unique deep-dive perspective.

## Input
- Primary Keyword: {keyword}
- Related Keywords: {relatedKeywords}

## Research Context (GROUNDING DATA)
{groundingContext}

## Editorial & Writing Standards (STRICTLY FOLLOW)

1. **Readability Targets**: 
   - Flesch Reading Ease: 60-80 (Plain English).
   - Gunning Fog Index: 7-12.
   - Flesch-Kincaid Grade Level: 6-9.
   - Average Sentence Length: 12-20 words (VARY length naturally to avoid monotony).
2. **Linguistic Precision**:
   - Use **Active Voice** instead of passive.
   - **Replace abstract nouns with concrete terms** (e.g., instead of "infrastructure improvements", use "installing 50,000 charging ports").
   - Cut unnecessary clauses and "nominalizations" (turn nouns back into verbs).
3. **Early Resolution**: State the correct general answer early. No withholding for narrative effect.
4. **Compression Discipline**: Every sentence must add information. Remove filler, rhetorical transitions ("Let's dive in"), and repetitive phrasing.
5. **Structural Readability**: 
   - Paragraphs must be concise and information-dense.
   - **VARY PARAGRAPH COUNTS**: Do not use rigid symmetry (e.g., 3 paragraphs for every H2). Some sections should be thick, others lean.
   - Use comparison tables or FAQ blocks ONLY if they reduce ambiguity more effectively than prose.
6. **Tone & Anti-AI Patterns**:
   - Neutral, professional, no hype, no emotional language.
   - NO "In conclusion", "It's worth noting", or "In the ever-evolving landscape".
   - **NO BRACKETED CITATIONS** (e.g., [1] or [Source]). Weave sources naturally into the narrative as authoritative facts.
   - Avoid stylistic crutches (limit em dashes to 1-2 per article).
7. **Human-Clean Output**: Avoid repetitive starting words and excessive symmetry. Use a "Human-Clean" rhythm.

## Auto-Categorization
Select the BEST category and subcategory from:
{categoryList}

## JSON Output Schema
{
  "title": "50-60 chars, authoritative, keyword near front",
  "seoTitle": "High-CTR title with keyword",
  "description": "150-160 chars meta description",
  "seoDescription": "Varied meta description for SEO",
  "fullText": "Markdown content. 1000-2500+ words. Professional headers (##). Varying paragraph lengths. No bracketed citations.",
  "keywords": ["10 LSI keywords from research"],
  "readingTime": number,
  "userIntent": "Diagnostic: What was the interpreted user intent?",
  "competitorGap": "Diagnostic: What gap did this article fill?",
  "suggestedCategory": "category id from list",
  "suggestedSubcategory": "subcategory slug from list",
  "sources": [{"title": "Source Name", "url": "https://..."}],
  "factsCited": ["Specific fact 1 with source", "Specific fact 2 with source"],
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
