"use client";

import { CompendiaPost } from "@/types";
import { motion } from "framer-motion";
import { Calendar, FileText, Share2, Quote, ExternalLink } from "lucide-react";
import { cn, truncateWords } from "@repo/lib/utils/utils";
import { useState } from "react";

interface PostCardProps {
    post: CompendiaPost;
}

export function PostCard({ post }: PostCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 snap-start bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            {post.journal || "Preprint"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                            <Quote className="w-3 h-3" />
                            {post.citationCount} Citations
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-headline font-bold leading-tight tracking-tight text-foreground">
                        {post.title}
                    </h2>

                    <div className="mt-4 text-sm text-muted-foreground font-medium">
                        {post.authors.slice(0, 3).join(", ")}
                        {post.authors.length > 3 && ` +${post.authors.length - 3} more`}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className={cn(
                        "prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground font-body leading-relaxed",
                        !isExpanded && "line-clamp-[12]"
                    )}>
                        {post.abstract || "No abstract available."}
                    </div>

                    {post.abstract && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-primary text-sm font-medium hover:underline focus:outline-none"
                        >
                            {isExpanded ? "Show Less" : "Read Abstract"}
                        </button>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span key={tag} className="text-xs border border-border px-2 py-1 rounded-md text-muted-foreground">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {post.pdfUrl && (
                            <a
                                href={post.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </a>
                        )}
                        {post.landingPageUrl && (
                            <a
                                href={post.landingPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Source
                            </a>
                        )}
                    </div>

                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
