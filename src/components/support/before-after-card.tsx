"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BeforeAfterCardProps {
    title: string;
    description: string;
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function BeforeAfterCard({
    title,
    description,
    beforeImage,
    afterImage,
    beforeLabel = "Free",
    afterLabel = "ReadMore+",
    className,
}: BeforeAfterCardProps) {
    const hasImages = beforeImage && afterImage;

    return (
        <div className={cn("w-full max-w-4xl mx-auto my-8", className)}>
            {hasImages ? (
                <>
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-2">{title}</h3>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {/* Before (Mobile: Bottom, Desktop: Left) */}
                        <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 order-2 md:order-1">
                            <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                                {beforeLabel}
                            </div>
                            <div className="aspect-[9/16] md:aspect-[3/4] relative">
                                <Image
                                    src={beforeImage}
                                    alt={`${title} - Before`}
                                    fill
                                    className="object-cover opacity-80 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                        </div>

                        {/* After (Mobile: Top, Desktop: Right) */}
                        <div className="relative group rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10 order-1 md:order-2">
                            <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">
                                {afterLabel}
                            </div>
                            <div className="aspect-[9/16] md:aspect-[3/4] relative">
                                <Image
                                    src={afterImage}
                                    alt={`${title} - After`}
                                    fill
                                    className="object-cover transition-all duration-500 scale-100 group-hover:scale-105"
                                />
                            </div>
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-2">{title}</h3>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Divider for desktop */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

                        {/* Before */}
                        <div className="space-y-2 text-center md:text-right md:pr-8 opacity-70">
                            <span className="inline-block text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground mb-2">
                                {beforeLabel}
                            </span>
                            <h4 className="font-semibold text-lg">Standard Experience</h4>
                            <p className="text-sm text-muted-foreground">
                                Limited access or basic functionality.
                            </p>
                        </div>

                        {/* After */}
                        <div className="space-y-2 text-center md:text-left md:pl-8">
                            <span className="inline-block text-xs font-bold px-2 py-1 rounded bg-primary text-primary-foreground mb-2">
                                {afterLabel}
                            </span>
                            <h4 className="font-semibold text-lg text-primary">Premium Experience</h4>
                            <p className="text-sm text-muted-foreground">
                                Full access, enhanced features, and priority support.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
