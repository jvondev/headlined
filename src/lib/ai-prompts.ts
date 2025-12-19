/**
 * AI Prompts for Article Generation
 * Optimized for canonical reference-grade content
 */

export const ARTICLE_GENERATION_PROMPT = `You are generating a canonical reference page. Output structured JSON only.

## Input
- Primary Keyword: {keyword}
- Related Keywords: {relatedKeywords}
- Target Category: {category}
- Target Subcategory: {subcategory}

## Context Analysis
Before writing, analyze:
1. **User Intent**: What is the searcher trying to accomplish?
2. **User Background**: Novice, professional, or researcher?
3. **Competitor Gap**: What do existing results miss?
4. **Resolution Path**: How can we provide the definitive answer?

## Output Requirements

### Writing Standards
- State the answer early—no withholding for narrative effect
- Optimize for resolution, not engagement
- Write as if this page will be cited by other sources
- Every sentence must add information—no filler
- Vary sentence length naturally (target avg: 12-20 words)
- Use Flesch Reading Ease 60-80, Gunning Fog 7-12, Flesch-Kincaid Grade 6-9
- Shorten sentences, use simpler vocabulary
- Replace abstract nouns with concrete terms
- Use active voice instead of passive
- Keep varying sentence length to avoid monotony

### Structural Guidelines
- Use headings only when they improve clarity
- Avoid rigid templated patterns
- Include comparison tables only if they reduce ambiguity
- Short FAQ block only for common misinterpretations
- Paragraphs should be concise and information-dense

### Tone
- Neutral, professional, no hype
- No em dashes, excessive symmetry, or AI-like patterns
- Precise language, no absolute claims unless true
- No emotional language, no branding, no calls to action

## JSON Output Schema
{
  "title": "Concise, SEO-optimized title (50-60 chars)",
  "seoTitle": "Title with primary keyword for meta tag",
  "description": "Meta description summarizing content (150-160 chars)",
  "seoDescription": "Description with keyword naturally included",
  "fullText": "Complete article in markdown format. Use ## for h2, ### for h3. Include lists where appropriate. Make it comprehensive but not padded.",
  "keywords": ["array", "of", "10", "relevant", "keywords"],
  "readingTime": 5,
  "userIntent": "Brief description of what the user is trying to accomplish",
  "competitorGap": "What this article provides that typical search results don't"
}

Output ONLY valid JSON. No markdown code blocks. No explanation before or after.`;

/**
 * Build the prompt with actual values
 */
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

/**
 * Keyword extraction prompt for manual articles
 */
export const KEYWORD_EXTRACTION_PROMPT = `Extract the top 10 most relevant keywords from the following content. Return only a JSON array of strings, nothing else.

Content:
{content}

Output format: ["keyword1", "keyword2", ...]`;

/**
 * SEO title/description generation prompt
 */
export const SEO_GENERATION_PROMPT = `Generate SEO-optimized title and meta description for the following article.

Title: {title}
Content summary: {summary}
Target keyword: {keyword}

Output only valid JSON:
{
  "seoTitle": "SEO title 50-60 chars with keyword",
  "seoDescription": "Meta description 150-160 chars with keyword naturally included"
}`;
