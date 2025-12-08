import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="h-screen w-full bg-background flex flex-col relative overflow-hidden">
            {/* Fake SeoCover Backdrop */}
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col p-6 md:p-12">
                <div className="max-w-4xl mx-auto w-full flex flex-col justify-center h-full">
                    {/* Breadcrumb skeleton */}
                    <div className="flex gap-2 mb-6">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-4 mb-8">
                        <div className="h-12 md:h-20 w-3/4 bg-muted rounded-xl animate-pulse" />
                        <div className="h-12 md:h-20 w-1/2 bg-muted rounded-xl animate-pulse" />
                    </div>

                    {/* Intro text skeleton */}
                    <div className="space-y-3 mb-12">
                        <div className="h-6 w-full bg-muted rounded animate-pulse" />
                        <div className="h-6 w-5/6 bg-muted rounded animate-pulse" />
                        <div className="h-6 w-4/6 bg-muted rounded animate-pulse" />
                    </div>

                    {/* Badges skeleton */}
                    <div className="flex gap-4">
                        <div className="h-8 w-24 bg-muted rounded-full animate-pulse" />
                        <div className="h-8 w-32 bg-muted rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
