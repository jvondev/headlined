export interface OpenAlexWork {
    id: string;
    doi: string | null;
    title: string;
    display_name: string;
    publication_year: number;
    publication_date: string;
    ids: {
        openalex: string;
        doi?: string;
        mag?: string;
    };
    primary_location: {
        source: {
            display_name: string;
        } | null;
        pdf_url: string | null;
        landing_page_url: string | null;
    };
    open_access: {
        is_oa: boolean;
        oa_url: string | null;
        oa_status: string;
    };
    authorships: {
        author: {
            id: string;
            display_name: string;
        };
        raw_affiliation_string: string;
    }[];
    biblio: {
        volume: string | null;
        issue: string | null;
        first_page: string | null;
        last_page: string | null;
    };
    cited_by_count: number;
    abstract_inverted_index: { [key: string]: number[] } | null;
    concepts: {
        id: string;
        display_name: string;
        score: number;
        level: number;
    }[];
    topics: {
        display_name: string;
        score: number;
        domain: { display_name: string };
        field: { display_name: string };
        subfield: { display_name: string };
    }[];
    keywords: { display_name: string; score: number }[];
    fwci: number | null;
    citation_normalized_percentile: { value: number; is_in_top_1_percent: boolean; is_in_top_10_percent: boolean } | null;
}

export interface CompendiaPost {
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    affiliations: string[];
    journal: string;
    date: string;
    citationCount: number;
    pdfUrl: string | null;
    landingPageUrl: string | null;
    tags: string[];
    keywords: { display_name: string; score: number }[];
    topics: { display_name: string; score: number; domain: string; field: string; subfield: string }[];
    concepts: { display_name: string; score: number; level: number }[];
    doi: string | null;
    isOpenAccess: boolean;
    openAccess: { status: string; is_oa: boolean; oa_url: string | null; oa_status: string };
    volume: string | null;
    issue: string | null;
    publication_date: string;
    fwci: number | null;
    citation_normalized_percentile: { value: number; is_in_top_1_percent: boolean; is_in_top_10_percent: boolean } | null;
    primary_location: { source: string; license: string | null; version: string | null } | null;
}

export interface SavedItem {
    id: string;
    slug: string;
    title: string;
    type: string;
    savedAt: string;
    note?: string;
}

