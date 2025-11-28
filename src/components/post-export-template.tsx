import React, { forwardRef } from "react";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface PostExportTemplateProps {
    post: Post;
    isLocked?: boolean;
}

export const PostExportTemplate = forwardRef<HTMLDivElement, PostExportTemplateProps>(
    ({ post, isLocked }, ref) => {
        const decodeHtmlEntities = (text: string) => {
            if (typeof window === 'undefined') return text;
            const textArea = document.createElement('textarea');
            textArea.innerHTML = text;
            return textArea.value;
        };

        const decodedTitle = decodeHtmlEntities(post.title);
        const decodedDescription = decodeHtmlEntities(post.description || "");

        return (
            <div
                ref={ref}
                id="post-export-template"
                className="relative overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl"
                style={{
                    width: "1080px",
                    height: "1350px",
                    borderRadius: "48px",
                }}
            >
                {/* Background Image - Using div with background-image to prevent html2canvas distortion */}
                <div
                    className="absolute inset-0 overflow-hidden bg-zinc-900"
                    style={{
                        backgroundImage: post.thumbnail_url ? `url(${post.thumbnail_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    {!post.thumbnail_url && (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                </div>

                {/* Card Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-16">
                    <div className="space-y-8 pt-8">
                        {/* Meta Tags */}
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-2xl font-semibold text-white tracking-wide uppercase shadow-lg">
                                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                {post.topic || 'News'}
                            </span>
                            <span className="text-2xl font-medium text-white/80 tracking-wide uppercase drop-shadow-md">
                                {new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="font-sans text-7xl font-black text-white leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                            {decodedTitle}
                        </h2>

                        {/* Description - 1 Line */}
                        <p className="text-3xl font-light text-white/90 leading-relaxed line-clamp-1 drop-shadow-lg max-w-5xl opacity-90">
                            {decodedDescription}
                        </p>
                    </div>

                    {/* Footer Branding */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-4 text-3xl font-bold text-white tracking-tight">
                            <span className="opacity-90">ReadMore.in</span>
                        </div>
                    </div>

                    {/* Locked State Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
                            <div className="flex flex-col items-center gap-6 p-10 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center shadow-xl">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-2xl font-bold text-white">Premium Content</p>
                                    <p className="text-xl text-white/70">Support to unlock</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

PostExportTemplate.displayName = "PostExportTemplate";
