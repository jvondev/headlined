"use client";

import Link from 'next/link';
import { ArrowRight, Newspaper, Sparkles } from 'lucide-react';

interface ArticleCTAProps {
    category: string;
    subcategory: string;
}

export function ArticleCTA({ category, subcategory }: ArticleCTAProps) {
    return (
        <div className="relative overflow-hidden my-12 group rounded-2xl bg-zinc-50 border border-zinc-200 p-6 transition-all hover:border-zinc-300 hover:shadow-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex items-center justify-center p-3 rounded-xl bg-white shadow-sm border border-zinc-100 flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-zinc-900" />
                </div>

                <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight leading-tight">
                        Get today's news about {subcategory}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
                        Stay updated with real-time coverage and breaking headlines.
                    </p>
                </div>

                <Link
                    href={`/news/${category}/${subcategory}`}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white font-medium text-sm transition-transform active:scale-95 group-hover:bg-black self-center"
                >
                    Read Today's News
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
