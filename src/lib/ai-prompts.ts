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

export const ARTICLE_GENERATION_PROMPT_V2 = `You are a senior journalist writing a definitive reference article. Your goal is to create content that:
1. Ranks #1 on Google
2. Passes AI detection tests
3. Demonstrates E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
4. Uses the grounded research data provided

## Input
- Primary Keyword: {keyword}
- Related Keywords: {relatedKeywords}

## Research Context (USE THIS DATA)
{groundingContext}

## CRITICAL: Anti-AI Detection Rules

### Sentence Structure (VARY THESE)
- Short punch: "This works." (3-5 words)
- Medium: "The data suggests a different conclusion." (6-12 words)  
- Long detailed: "When you factor in the infrastructure costs alongside the regulatory hurdles and market adoption rates, the picture becomes far more nuanced than surface-level analysis would suggest." (20-35 words)

### Paragraph Rhythm
- Mix 1-sentence paragraphs with 4-5 sentence ones
- Random placement, not predictable

### NEVER USE (AI Patterns)
❌ "In this article, we will explore..."
❌ "Let's dive into..."
❌ "It's worth noting that..."
❌ "In conclusion..."
❌ "This comprehensive guide..."
❌ "In the ever-evolving landscape..."
❌ Em dashes (—) more than once
❌ Perfect parallel structure in lists
❌ Starting 3+ paragraphs the same way

### DO USE (Human Patterns)
✅ Contractions: "it's", "don't", "won't", "can't"
✅ First-person occasionally: "I've seen...", "In my experience..."
✅ Start sentences with "But", "And", "So"
✅ Rhetorical questions
✅ Specific numbers and dates from the research
✅ Direct quotes from sources
✅ Imperfect sentence fragments occasionally

## E-E-A-T Requirements

### Experience
- Include specific real examples from the research data
- Reference actual companies, products, dates, prices
- Add "Date context" for freshness

### Expertise  
- Use precise terminology, then explain simply
- Cite specific statistics from the research
- Include comparison data where relevant

### Authoritativeness
- Reference the sources provided in research
- Quote industry experts or official documentation
- Connect to broader industry implications

### Trustworthiness
- Acknowledge limitations honestly
- Present multiple viewpoints
- Include "Last updated: {today}" signal

## Structure Guidelines

### NOT Like This (Robotic)
❌ H2 → intro paragraph → H3 → bullets → H3 → bullets → conclusion

### Like This (Natural)
✅ Start with the answer immediately
✅ Use H2 only 2-3 times, not every section
✅ Mix paragraphs, lists, and quotes naturally
✅ No predictable rhythm
✅ End strong, not with "In conclusion"

## Auto-Categorization

Based on the keyword, select the BEST category and subcategory from:
{categoryList}

## JSON Output Schema

{
  "title": "50-60 chars, keyword near front, compelling",
  "seoTitle": "Title optimized for CTR with keyword",
  "description": "150-160 chars meta description with keyword",
  "seoDescription": "Slightly different meta description for variety",
  "fullText": "Complete article in markdown. Use ## sparingly. Include [Source Name] citations inline.",
  "keywords": ["10 LSI keywords from research"],
  "readingTime": number,
  "suggestedCategory": "category id from list",
  "suggestedSubcategory": "subcategory slug from list",
  "sources": [{"title": "Source Name", "url": "https://..."}],
  "factsCited": ["Specific fact 1 with source", "Specific fact 2 with source"],
  "lastVerified": "2025-12-20"
}

Output ONLY valid JSON. No explanation. No markdown code blocks around the JSON.`;

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
