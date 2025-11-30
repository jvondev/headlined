"use client";

import { useSearchParams } from "next/navigation";
import { SearchContent } from "@/components/search-content";
import { useEffect, useState } from "react";

export function SearchView() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // For now, we just render the search content (input)
    // Real search results implementation will be added later

    return <SearchContent isLoading={isLoading} />;
}
