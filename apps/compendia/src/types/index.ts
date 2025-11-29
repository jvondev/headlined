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
    };
    authorships: {
        author: {
            id: string;
            display_name: string;
        };
        raw_affiliation_string: string;
    }[];
    cited_by_count: number;
    abstract_inverted_index: { [key: string]: number[] } | null;
    concepts: {
        id: string;
        display_name: string;
        score: number;
    }[];
}

export interface CompendiaPost {
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    journal: string;
    date: string;
    citationCount: number;
    pdfUrl: string | null;
    landingPageUrl: string | null;
    tags: string[];
}
