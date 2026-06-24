
/**
 * Free Data Grounding Service V4 - 2025 Edition
 * Optimized for Efficiency & 'use server' compatibility
 */

export interface SearchResult {
    title: string;
    url: string;
    description: string;
}

export interface GroundingData {
    serpResults: SearchResult[];
    articleContent: string[];
    wikiSummary: string | null;
    sources: { title: string; url: string }[];
    instantAnswer: string | null;
}

/**
 * 1. TAVILY AI SEARCH - High Quality Grounding
 */
export async function searchTavily(query: string): Promise<{
    results: SearchResult[];
    answer: string | null;
}> {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    if (!TAVILY_API_KEY) {
        console.log('Tavily: No API key (TAVILY_API_KEY), skipping');
        return { results: [], answer: null };
    }

    try {
        const res = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query,
                search_depth: 'basic',
                include_answer: true,
                max_results: 5,
            }),
        });

        if (!res.ok) return { results: [], answer: null };

        const data = await res.json();
        const results = (data.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            description: r.content?.slice(0, 300) || '',
        }));

        return { results, answer: data.answer || null };
    } catch (e) {
        console.error('Tavily error:', e);
        return { results: [], answer: null };
    }
}

/**
 * 2. GOOGLE CUSTOM SEARCH
 */
export async function searchGoogle(query: string): Promise<SearchResult[]> {
    const GOOGLE_CSE_KEY = process.env.GOOGLE_CSE_KEY;
    const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

    if (!GOOGLE_CSE_KEY || !GOOGLE_CSE_ID) return [];

    try {
        const res = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CSE_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5`
        );
        if (!res.ok) return [];

        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            title: item.title,
            url: item.link,
            description: item.snippet || '',
        }));
    } catch (e) {
        return [];
    }
}

/**
 * 3. JINA SEARCH - Unlimited Free
 */
export async function searchJina(query: string): Promise<SearchResult[]> {
    try {
        const res = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
            headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) return [];

        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
            return data.data.slice(0, 5).map((r: any) => ({
                title: r.title || r.name || 'Untitled',
                url: r.url || r.link || '',
                description: r.description || r.content?.slice(0, 200) || '',
            }));
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * 4. JINA READER - URL to Markdown
 */
export async function readWithJina(url: string): Promise<string> {
    try {
        const res = await fetch(`https://r.jina.ai/${url}`, {
            headers: { 'Accept': 'text/plain' },
        });

        if (!res.ok) return '';
        const text = await res.text();

        if (text.length < 200 || text.includes('Access Denied')) return '';

        return text.slice(0, 2500);
    } catch (e) {
        return '';
    }
}

/**
 * 5. WIKIPEDIA
 */
export async function getWikipedia(topic: string): Promise<{
    summary: string | null;
    related: SearchResult[];
}> {
    const cleanTopic = topic.split(' ').slice(0, 4).join('_').replace(/[^a-zA-Z0-9_-]/g, '');

    try {
        const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTopic)}`,
            { headers: { 'Accept': 'application/json' } }
        );

        let summary: string | null = null;
        if (summaryRes.ok) {
            const data = await summaryRes.json();
            summary = data.extract || null;
        }

        const searchRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=5&format=json&origin=*`
        );

        let related: SearchResult[] = [];
        if (searchRes.ok) {
            const data = await searchRes.json();
            const titles = data[1] || [];
            const urls = data[3] || [];
            related = titles.map((t: string, i: number) => ({
                title: t,
                url: urls[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(t)}`,
                description: 'Wikipedia article',
            }));
        }

        return { summary, related };
    } catch (e) {
        return { summary: null, related: [] };
    }
}

/**
 * MAIN GROUNDING ORCHESTRATOR
 */
export async function gatherGroundingData(keyword: string): Promise<GroundingData> {
    console.log('📡 Grounding search (ALL-IN) for:', keyword);

    // Run ALL search functions in parallel
    const [wikiResult, jinaResults, tavilyResult, googleResults] = await Promise.all([
        getWikipedia(keyword),
        searchJina(keyword),
        searchTavily(keyword),
        searchGoogle(keyword)
    ]);

    const serpResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // Ordered pool of results for priority-based selection
    // Priority: Tavily (often better snippets) > Jina > Google > Wiki
    const allResults = [
        ...tavilyResult.results,
        ...jinaResults,
        ...googleResults,
        ...wikiResult.related
    ];

    for (const r of allResults) {
        if (r.url && !seenUrls.has(r.url) && serpResults.length < 8) {
            if (r.description.includes('Access Denied')) continue;
            serpResults.push(r);
            seenUrls.add(r.url);
        }
    }

    const articleContent: string[] = [];
    // If we have an instant answer or wiki summary, we might not need deep dive, 
    // but we check if we lack a "definitive" summary.
    if (!tavilyResult.answer && !wikiResult.summary && serpResults.length > 0) {
        const content = await readWithJina(serpResults[0].url);
        if (content) articleContent.push(content);
    }

    return {
        serpResults,
        articleContent,
        wikiSummary: wikiResult.summary,
        sources: serpResults.map(r => ({ title: r.title, url: r.url })),
        instantAnswer: tavilyResult.answer,
    };
}

/**
 * Format for AI prompt - Optimized for Gemini
 * MUST BE ASYNC for 'use server' compliance
 */
export async function formatGroundingContext(data: GroundingData): Promise<string> {
    const parts: string[] = [];

    if (data.instantAnswer) {
        parts.push(`[PRE-PROCESSED SEARCH SUMMARY]\n${data.instantAnswer}`);
    }

    if (data.wikiSummary) {
        parts.push(`[WIKIPEDIA CONTEXT]\n${data.wikiSummary}`);
    }

    if (data.serpResults.length > 0) {
        const snippets = data.serpResults
            .map((r, i) => `Source [${i + 1}]: ${r.title}\nURL: ${r.url}\nExcerpt: ${r.description}`)
            .join('\n\n');
        parts.push(`[SEARCH SNIPPETS]\n${snippets}`);
    }

    if (data.articleContent.length > 0) {
        const cleanText = data.articleContent[0].replace(/\s+/g, ' ').slice(0, 2000);
        parts.push(`[DEEP DIVE SOURCE]\n${cleanText}`);
    }

    if (parts.length === 0) return 'No external grounding available.';

    return `### GROUNDING DATA\n\n${parts.join('\n\n---\n\n')}`;
}
