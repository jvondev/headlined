"use client";

import { motion } from "framer-motion";
import { cn } from "@repo/lib/utils/utils";
import Image from "next/image";

interface BeforeAfterCardProps {
    title: string;
    description: string;
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    beforeTitle?: string;
    beforeDescription?: string;
    afterTitle?: string;
    afterDescription?: string;
    className?: string;
}

export function BeforeAfterCard({
    title,
    description,
    beforeImage,
    afterImage,
    beforeLabel = "Free",
    afterLabel = "ReadMore+",
    beforeTitle = "Standard Experience",
    beforeDescription = "Limited access or basic functionality.",
    afterTitle = "Premium Experience",
    afterDescription = "Full access, enhanced features, and priority support.",
    className,
}: BeforeAfterCardProps) {
    return (
        <div className={cn("w-full max-w-5xl mx-auto my-12", className)}>
            <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Before Card */}
                <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-muted/30 order-2 md:order-1">
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <div className="mb-4">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted-foreground/20 text-muted-foreground">
                                {beforeLabel}
                            </span>
                        </div>
                        <h4 className="text-xl font-semibold mb-2">{beforeTitle}</h4>
                        <p className="text-muted-foreground leading-relaxed">{beforeDescription}</p>
                    </div>
                    {beforeImage && (
                        <div className="relative w-full aspect-[16/9] md:aspect-[4/3] mt-auto">
                            <Image
                                src={beforeImage}
                                alt={`${title} - Before`}
                                fill
                                className="object-cover opacity-90 grayscale-[0.3] transition-all duration-500 hover:grayscale-0"
                            />
                        </div>
                    )}
                </div>

                {/* After Card */}
                <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border-2 border-primary/20 bg-card shadow-2xl shadow-primary/5 order-1 md:order-2 group">
                    <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
                        <div className="mb-4">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                                {afterLabel}
                            </span>
                        </div>
                        <h4 className="text-xl font-bold mb-2 text-foreground">{afterTitle}</h4>
                        <p className="text-muted-foreground leading-relaxed">{afterDescription}</p>
                    </div>
                    {afterImage && (
                        <div className="relative w-full aspect-[16/9] md:aspect-[4/3] mt-auto">
                            <Image
                                src={afterImage}
                                alt={`${title} - After`}
                                fill
                                className="object-cover transition-all duration-500 scale-100 group-hover:scale-105"
                            />
                        </div>
                    )}
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                </div>
            </div>
        </div>
    );
}
