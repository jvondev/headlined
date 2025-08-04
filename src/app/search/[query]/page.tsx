
import { Suspense } from 'react';
import { SearchResultsClient, SearchResultsClientSkeleton } from './client';
import { SearchHeader } from './header';

type SearchPageProps = {
    params: {
        query: string;
    };
};

// Make sure the page is dynamically rendered
export const dynamic = 'force-dynamic';

export default function SearchPage({ params }: SearchPageProps) {
    const currentQuery = params.query;
    const query = currentQuery || '';

    return (
        <div className="bg-background min-h-screen">
            <SearchHeader initialQuery={decodeURIComponent(query)} />
            <main className="container mx-auto px-4 py-8">
                <Suspense fallback={<SearchResultsClientSkeleton />}>
                    <SearchResultsClient query={decodeURIComponent(query)} />
                </Suspense>
            </main>
        </div>
    );
}
