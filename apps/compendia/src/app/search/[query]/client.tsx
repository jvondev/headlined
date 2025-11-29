"use client";

import { useEffect, useState, FC } from "react";
import { useSearch } from "@repo/lib/hooks/use-search";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { DynamicIcon } from "@/components/dynamic-icon";
import { AlertTriangle, BookText } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import type { SearchResult } from "@repo/lib/types";
import { Button } from "@repo/ui/components/ui/button";
import { truncateWords } from "@repo/lib/utils/utils";

const PAGE_SIZE = 5;

// A new component to handle highlighting
const HighlightedText: FC<{ text: string; query: string }> = ({ text, query }) => {
    if (!query.trim()) {
        return <span>{text}</span>;
    }

    const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(Boolean));
    const textParts = text.split(/(\b)/); // Split by word boundaries, keeping delimiters

    return (
        <span>
            {textParts.map((part, index) => {
                // Check for whole word, case-insensitive match
                if (queryWords.has(part.toLowerCase())) {
                    return <strong key={index}>{part}</strong>;
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};


interface SearchResultsClientProps {
    query: string;
}

export function SearchResultsClient({ query }: SearchResultsClientProps) {
    const { isReady, search, results, setResults } = useSearch();
    const [hasSearched, setHasSearched] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        if (isReady && query) {
            setVisibleCount(PAGE_SIZE); // Reset visible count for new search
            search(query).finally(() => setHasSearched(true));
        } else if (!query) {
            setResults([]); // Clear results if query is empty
            setHasSearched(false);
        }
    }, [isReady, query, search, setResults]);

    const getResultUrl = (result: SearchResult) => {
        let url = `/post/${result.slug}`;
        return url;
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + PAGE_SIZE);
    }

    const visibleResults = results.slice(0, visibleCount);
    const hasMore = results.length > visibleCount;

    if (!isReady || (query && !hasSearched)) {
        return <SearchResultsClientSkeleton />;
    }

    if (hasSearched && results.length === 0) {
        return (
            <div className="text-center py-16">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-headline font-semibold">No Results Found</h2>
                <p className="mt-2 text-muted-foreground">
                    Your search for "{decodeURIComponent(query)}" did not return any results.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="relative flex flex-col gap-8 pl-6 before:absolute before:left-[23px] md:before:left-[29.5px] before:top-0 before:h-full before:w-px before:bg-border">
                {visibleResults.map((result) => (
                    <div key={result.id} className="relative">
                        <div className="absolute -left-[1.3rem] md:-left-[1.9rem] top-1 flex size-8 md:size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {result.icon ? (
                                <DynamicIcon name={result.icon} className="size-4 md:size-5" />
                            ) : (
                                <BookText className="size-4 md:size-5" /> // Default to book icon for post
                            )}
                        </div>
                        <Card className="ml-6 md:ml-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{result.type}</Badge>
                                    {result.topic && <span className="text-sm text-muted-foreground">{result.topic}</span>}
                                </div>
                                <CardTitle className="mt-2">
                                    <Link href={getResultUrl(result)} className="hover:underline">
                                        <HighlightedText text={result.title} query={query} />
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    <HighlightedText text={truncateWords(result.content, 10)} query={query} />
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="text-center mt-12">
                    <Button onClick={loadMore}>Load More</Button>
                </div>
            )}
        </div>
    );
}


export function SearchResultsClientSkeleton() {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="relative flex flex-col gap-8 pl-6 before:absolute before:left-[29.5px] before:top-0 before:h-full before:w-px before:bg-border">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative flex gap-4">
                        <Skeleton className="absolute top-1 -left-[1.9rem] size-10 rounded-full" />
                        <div className="ml-8 w-full">
                            <Card>
                                <CardHeader>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <Skeleton className="h-6 w-3/4 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}