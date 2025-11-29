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
                className="relative bg-[#000000]"
                style={{
                    width: "1080px",
                    height: "1350px",
                }}
            >
                {/* Outer "Glass" Border Ring - Thicker & bolder */}
                < div
                    className="absolute inset-2 rounded-[64px] border-[6px] border-white/20 z-50 pointer-events-none m-4"
                    style={{
                        boxShadow: "0 0 60px rgba(255,255,255,0.05), inset 0 0 40px rgba(255,255,255,0.05)"
                    }}
                />

                {/* Main Content Card - Floating inside the ring */}
                <div className="absolute inset-10 rounded-[48px] overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl m-4">
                    {/* Background Image */}
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
                        {/* Gradient Overlay - Smooth fade for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90" />
                    </div>

                    {/* Card Content - Increased padding for aesthetic bleed */}
                    <div className="absolute inset-0 flex flex-col justify-between p-20">
                        <div className="space-y-12 pt-6">
                            {/* Meta Tags */}
                            <div className="flex items-center gap-6">
                                <span className="text-xl font-semibold text-white tracking-wide uppercase drop-shadow-md whitespace-nowrap">
                                    {post.topic || 'News'}
                                </span>
                                <span className="text-xl font-semibold text-white/80 tracking-wide uppercase drop-shadow-md whitespace-nowrap">
                                    {new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            {/* Title - Reduced size, tighter leading */}
                            <h2 className="font-sans text-[4.5rem] font-black text-white leading-[1.15] tracking-tighter text-balance drop-shadow-2xl pb-2">
                                {decodedTitle}
                            </h2>

                            {/* Description - 1 Line */}
                            <p className="text-3xl font-medium text-white/90 leading-[1.6] drop-shadow-lg max-w-5xl opacity-90 overflow-hidden text-ellipsis pb-3" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                {decodedDescription}
                            </p>
                        </div>

                        {/* Footer Branding */}
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4 text-3xl font-bold text-white tracking-tight drop-shadow-lg">
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
            </div >
        );
    }
);

PostExportTemplate.displayName = "PostExportTemplate";
