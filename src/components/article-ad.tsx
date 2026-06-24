"use client";

interface ArticleAdProps {
    index?: number;
}

export function ArticleAd({ index = 0 }: ArticleAdProps) {
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
        </div>
    );
}
