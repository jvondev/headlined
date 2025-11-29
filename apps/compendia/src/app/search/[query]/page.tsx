
import { Suspense, use } from 'react'; // Import use
import { SearchResultsClient, SearchResultsClientSkeleton } from './client';
import { SearchHeader } from './header';

type SearchPageProps = {
    params: Promise<{ // params is now a Promise
        query: string;
    }>;
};

export async function generateStaticParams() {
  // This function is intentionally left empty for client-side search.
  return [{ query: 'initial' }]; // Return a dummy path
}

export default function SearchPage({ params }: SearchPageProps) {
    const resolvedParams = use(params); // Unwrap the Promise
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
