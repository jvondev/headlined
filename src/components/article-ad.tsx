"use client";

interface ArticleAdProps {
    index?: number;
    variant?: 'display' | 'native';
}

export function ArticleAd({ index = 0, variant = 'native' }: ArticleAdProps) {
    // If native variant is requested but we want to use the provider,
    // we might want to standardize. For now, using the provider structure for all.
    // The user provided structure seems to be a display ad slot.

    return (
        <div className="w-full my-8 py-2">
            <div className="relative w-full min-h-[280px] bg-transparent rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                <div
                    // @ts-ignore
                    ta-ad-container=""
                    id={`reader-ad-${index}`}
                    className="w-full h-full min-h-[280px] flex items-center justify-center"
                />
            </div>
            {/* Optional: Keep 'Sponsored' label if desired, but provider usually handles it */}
            <div className="mt-2 text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded inline-block text-zinc-400">Sponsored</div>
        </div>
    );
}
