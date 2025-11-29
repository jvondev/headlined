"use client";


import { SearchPageHeader } from "@/components/search/search-page-header";

export function SearchHeader({ initialQuery }: { initialQuery: string }) {

    return (
        <SearchPageHeader initialQuery={initialQuery} />
    );
}