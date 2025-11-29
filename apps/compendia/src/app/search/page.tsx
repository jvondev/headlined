import { Suspense } from 'react';
import { SearchView } from '@/components/search/search-view';
import { PostPageLoadingSkeleton } from '@/components/post-page-loading-skeleton';

export default function SearchPage() {
    return (
        <Suspense fallback={<PostPageLoadingSkeleton />}>
            <SearchView />
        </Suspense>
    );
}
