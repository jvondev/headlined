import { OpenAlexWork, CompendiaPost } from "@/types";
import { subDays, format } from "date-fns";

const OPENALEX_API_URL = "https://api.openalex.org/works";

// Helper to decode inverted index abstract
function decodeAbstract(invertedIndex: { [key: string]: number[] } | null): string {
    if (!invertedIndex) return "";

    const wordMap: { [index: number]: string } = {};
    let maxIndex = 0;

    for (const [word, indices] of Object.entries(invertedIndex)) {
        for (const index of indices) {
            wordMap[index] = word;
            if (index > maxIndex) maxIndex = index;
        }
    }

    const words: string[] = [];
    for (let i = 0; i <= maxIndex; i++) {
        if (wordMap[i]) {
            words.push(wordMap[i]);
        }
    }

    return words.join(" ");
}

export async function fetchRecentWorks(page = 1, perPage = 10, filters?: { fromDate?: string; toDate?: string }): Promise<CompendiaPost[]> {
    // Get date for 7 days ago as default
    const sevenDaysAgo = subDays(new Date(), 7);
    const defaultFromDate = format(sevenDaysAgo, "yyyy-MM-dd");

    const fromDate = filters?.fromDate || defaultFromDate;

    // Build query
    let filterString = `from_publication_date:${fromDate}`;
    if (filters?.toDate) {
        filterString += `,to_publication_date:${filters.toDate}`;
    }

    // We remove 'select' to ensure we get all fields including new ones like topics and keywords
    const params = new URLSearchParams({
        filter: filterString,
        sort: "publication_date:desc",
        page: page.toString(),
        per_page: perPage.toString(),
    });

    try {
        const response = await fetch(`${OPENALEX_API_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`OpenAlex API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) {
            console.warn("OpenAlex API returned unexpected format:", data);
            return [];
        }

        const works: OpenAlexWork[] = data.results;

        return works.map((work) => ({
            id: work.id,
            title: work.display_name || work.title,
            abstract: decodeAbstract(work.abstract_inverted_index),
            authors: work.authorships.map((a: any) => a.author.display_name),
            affiliations: work.authorships.map((a: any) => a.raw_affiliation_string).filter(Boolean),
            journal: (work.primary_location as any)?.source?.display_name || "Unknown Source",
            date: work.publication_date,
            citationCount: work.cited_by_count,
            pdfUrl: (work.primary_location as any)?.pdf_url || work.open_access?.oa_url,
            landingPageUrl: (work.primary_location as any)?.landing_page_url || work.ids.doi || null,
            tags: work.keywords?.map((k: any) => k.display_name).slice(0, 5) || [],
            keywords: work.keywords?.map((k: any) => ({ display_name: k.display_name, score: k.score })) || [],
            topics: work.topics?.map((t: any) => ({
                display_name: t.display_name,
                score: t.score,
                domain: t.domain.display_name,
                field: t.field.display_name,
                subfield: t.subfield.display_name
            })) || [],
            concepts: work.concepts?.map((c: any) => ({ display_name: c.display_name, score: c.score, level: c.level })) || [],
            doi: work.doi,
            isOpenAccess: work.open_access?.is_oa || false,
            openAccess: {
                status: work.open_access?.oa_status || "closed",
                is_oa: work.open_access?.is_oa || false,
                oa_url: work.open_access?.oa_url || null,
                oa_status: work.open_access?.oa_status || "closed"
            },
            volume: work.biblio?.volume || null,
            issue: work.biblio?.issue || null,
            publication_date: work.publication_date,
            fwci: work.fwci,
            citation_normalized_percentile: work.citation_normalized_percentile,
            primary_location: work.primary_location ? {
                source: (work.primary_location as any).source?.display_name || "Unknown Source",
                license: (work.primary_location as any).license || null,
                version: (work.primary_location as any).version || null
            } : null,
        }));
    } catch (error) {
        console.error("Failed to fetch works:", error);
        return [];
    }
}
