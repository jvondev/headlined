"use client";

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PostCarousel } from '@/components/post-carousel';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
    const params = useParams();
    const view = params.view as string; // 'today', 'yesterday', 'archive', 'this-week', 'this-month'

    return (
        <main className="h-screen w-full bg-background overscroll-none">
            <PostCarousel key={view} view={view} />
        </main>
    );
}

export function DashboardClient() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
