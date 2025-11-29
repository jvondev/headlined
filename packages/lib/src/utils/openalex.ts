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

export async function fetchRecentWorks(page = 1, perPage = 10): Promise<CompendiaPost[]> {
    // Get date for 7 days ago
    const sevenDaysAgo = subDays(new Date(), 7);
    const fromDate = format(sevenDaysAgo, "yyyy-MM-dd");

    // Build query
    // filter=from_publication_date:2023-10-20
    // sort=cited_by_count:desc (to get popular ones, or maybe publication_date:desc)
    // Let's mix it: sort by publication date desc to get latest
    const params = new URLSearchParams({
        filter: `from_publication_date:${fromDate},has_abstract:true`,
        sort: "publication_date:desc",
        page: page.toString(),
        per_page: perPage.toString(),
        select: "id,doi,title,display_name,publication_year,publication_date,ids,primary_location,open_access,authorships,cited_by_count,abstract_inverted_index,concepts"
    });

    try {
        const response = await fetch(`${OPENALEX_API_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`OpenAlex API error: ${response.statusText}`);
        }

        const data = await response.json();
        const works: OpenAlexWork[] = data.results;

        return works.map((work) => ({
            id: work.id,
            title: work.display_name || work.title,
            abstract: decodeAbstract(work.abstract_inverted_index),
            authors: work.authorships.map((a) => a.author.display_name),
            journal: work.primary_location?.source?.display_name || "Unknown Source",
            date: work.publication_date,
            citationCount: work.cited_by_count,
            pdfUrl: work.primary_location?.pdf_url || work.open_access?.oa_url,
            landingPageUrl: work.primary_location?.landing_page_url || work.ids.doi || null,
            tags: work.concepts.slice(0, 3).map((c) => c.display_name),
        }));
    } catch (error) {
        console.error("Failed to fetch works:", error);
        return [];
    }
}
