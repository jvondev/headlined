
import { Suspense } from 'react';
import { SearchResultsClient, SearchResultsClientSkeleton } from './client';
import { SearchHeader } from './header';

type SearchPageProps = {
    params: Promise<{
        query: string;
    }>;
};

export async function generateStaticParams() {
    // This function is intentionally left empty for client-side search.
    return [{ query: 'initial' }]; // Return a dummy path
}

export default async function SearchPage({ params }: SearchPageProps) {
    const resolvedParams = await params; // Await the Promise
    const currentQuery = resolvedParams.query;
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
