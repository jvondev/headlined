// PERFORMANCE: Simplified skeleton - minimal DOM, no gradients
export const PostCardSkeleton = () => {
    return (
        <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-zinc-900 border border-zinc-800 animate-pulse">
            {/* Minimal content placeholder */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="space-y-3">
                    <div className="h-6 w-20 rounded-full bg-zinc-800" />
                    <div className="h-8 w-3/4 rounded bg-zinc-800" />
                    <div className="h-8 w-full rounded bg-zinc-800" />
                </div>
            </div>
        </div>
    );
};
