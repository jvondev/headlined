export const PostCardSkeleton = () => {
    return (
        <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-card border border-border/50 shadow-sm animate-pulse">
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10" />

            {/* Content skeleton */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
                <div className="space-y-4 pt-4">
                    {/* Meta tag skeleton */}
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-16 rounded-full bg-muted/40" />
                        <div className="h-4 w-20 rounded bg-muted/30" />
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-2">
                        <div className="h-8 w-3/4 rounded bg-muted/40" />
                        <div className="h-8 w-full rounded bg-muted/40" />
                        <div className="h-8 w-2/3 rounded bg-muted/40" />
                    </div>
                </div>
            </div>
        </div>
    );
};
