'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types';
import { fetchArticleByDateAndSlug, fetchPostsByDate, getRelatedArticles } from '@/lib/article-utils';
import { ExpandedReader } from '@/components/expanded-reader';
import { FloatingActionDock } from '@/components/floating-action-dock';
import { X, Loader2, AlertCircle, Home, Newspaper, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PostExportTemplate } from '@/components/post-export-template';

type LoadingState = 'loading' | 'success' | 'error' | 'not-article';

export default function ArticleClientPage() {
    const router = useRouter();
    const pathname = usePathname();

    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>('loading');
    const [readerDarkMode, setReaderDarkMode] = useState(true);

    // Floating Action Dock state
    const [hasMoreContent, setHasMoreContent] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [remainingSections, setRemainingSections] = useState(0);

    // Export state
    const [isExporting, setIsExporting] = useState(false);
    const [exportPlatform, setExportPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
    const [base64Thumbnail, setBase64Thumbnail] = useState<string | null>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    // Parse date/slug from pathname
    const articleInfo = useMemo(() => {
        // Match /article/YYYY-MM-DD/slug
        // We look for the pattern segments after /article/
        // pathname might be "/article/2025-12-10/my-slug"
        const match = pathname?.match(/\/article\/(\d{4}-\d{2}-\d{2})\/(.+)/);

        if (match) {
            return { date: match[1], slug: match[2], isArticle: true };
        }

        // Handle root /article path or invalid formats
        return { date: null, slug: null, isArticle: false };
    }, [pathname]);

    // Fetch article data
    useEffect(() => {
        let cancelled = false;

        async function loadArticle() {
            if (!articleInfo.isArticle || !articleInfo.date || !articleInfo.slug) {
                // If we are at /article root or invalid path, handle gracefully
                if (pathname === '/article' || pathname === '/article/') {
                    router.replace('/app/today');
                } else {
                    setLoadingState('error');
                }
                return;
            }

            setLoadingState('loading');

            try {
                const article = await fetchArticleByDateAndSlug(articleInfo.date, articleInfo.slug);

                if (cancelled) return;

                if (!article) {
                    setLoadingState('error');
                    return;
                }

                setPost(article);
                setLoadingState('success');
                document.title = `${article.title} | Headlined`;

                // Fetch related articles
                const allPosts = await fetchPostsByDate(articleInfo.date);
                if (!cancelled) {
                    const related = getRelatedArticles(article, allPosts, 10);
                    setRelatedPosts(related);
                }
            } catch (error) {
                console.error('Failed to load article:', error);
                if (!cancelled) {
                    setLoadingState('error');
                }
            }
        }

        loadArticle();
        return () => { cancelled = true; };
    }, [articleInfo, pathname, router]);

    const handleClose = () => {
        // If we have history, go back (smooth SPA feel)
        // Otherwise go to home (e.g. deep link landing)
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push('/app/today');
        }
    };

    // Handle download/export
    const handleDownload = async (platform: 'tiktok' | 'instagram') => {
        if (isExporting || !post) return;
        setExportPlatform(platform);
        setIsExporting(true);

        try {
            if (post.thumbnail_url) {
                try {
                    const response = await fetch(post.thumbnail_url);
                    const blob = await response.blob();
                    await new Promise<void>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (reader.result) setBase64Thumbnail(reader.result as string);
                            resolve();
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    // Fallback to proxy if direct fetch fails (CORS)
                    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(post.thumbnail_url!)}&output=jpg`;
                    const response = await fetch(proxyUrl);
                    const blob = await response.blob();
                    await new Promise<void>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (reader.result) setBase64Thumbnail(reader.result as string);
                            resolve();
                        };
                        reader.readAsDataURL(blob);
                    });
                }
            }

            await new Promise(resolve => setTimeout(resolve, 100));
            const html2canvas = (await import('html2canvas')).default;

            if (exportRef.current) {
                const canvas = await html2canvas(exportRef.current, {
                    scale: 2, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
                });
                const link = document.createElement('a');
                link.download = `headlined-${post.slug}-${platform}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
            setBase64Thumbnail(null);
        }
    };

    const readingTime = useMemo(() => {
        if (!post) return 1;
        if (post.readingTime && post.readingTime > 0) return post.readingTime;
        const words = (post.fullText || post.description || '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    }, [post]);

    // Loading state
    if (loadingState === 'loading') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                    <p className="text-white/60 text-sm">Loading article...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (loadingState === 'error' || !post) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center px-6">
                    <div className="p-4 rounded-full bg-red-500/10"><AlertCircle className="w-8 h-8 text-red-400" /></div>
                    <h1 className="text-xl font-bold text-white">Article Not Found</h1>
                    <p className="text-white/60 text-sm max-w-sm">This article may have been removed or the link is invalid.</p>
                    <Link href="/app/today" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium">
                        <Home className="w-4 h-4" /> Go to Headlines
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Success - render article
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overscroll-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Hidden Export Template */}
                <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
                    <PostExportTemplate ref={exportRef} post={post} isLocked={false} variant={exportPlatform} thumbnailOverride={base64Thumbnail} />
                </div>

                {/* Close Button */}
                <motion.button
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-[60] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <X className="w-5 h-5" />
                </motion.button>

                {/* Scrollable Content */}
                <div id="article-scroll-container" className="flex-1 overflow-y-auto no-scrollbar overscroll-contain pb-32">
                    {/* Hero Section */}
                    <div className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden">
                        {post.thumbnail_url ? (
                            <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pb-12 z-20">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-black uppercase tracking-widest shadow-lg">
                                        {post.topic || 'News'}
                                    </span>
                                    <span className="text-xs text-white/90 uppercase bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        {articleInfo.date && new Date(articleInfo.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl">
                                    {post.title}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="relative z-10 bg-zinc-950 -mt-6 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
                        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-4 mb-2" />

                        {/* Expanded Reader */}
                        <ExpandedReader
                            fullText={post.fullText ?? null}
                            description={post.description}
                            keywords={post.keywords || []}
                            slug={post.slug}
                            date={post.date}
                            readingTime={readingTime}
                            isPremium={false}
                            articleUrl={post.link}
                            onHighlightSave={(quote) => console.log('Quote saved:', quote)}
                            onContinueStateChange={(hasMore, isGen, remaining) => {
                                setHasMoreContent(hasMore);
                                setIsGeneratingContent(isGen);
                                setRemainingSections(remaining);
                            }}
                            onContinueRequest={() => (window as any).__expandedReaderContinue?.()}
                            onDownload={handleDownload}
                            isExporting={isExporting}
                            onThemeChange={setReaderDarkMode}
                            onClose={handleClose}
                            onStickyChange={() => { }}
                        />

                        {/* Related Articles */}
                        {relatedPosts.length > 0 && articleInfo.date && (
                            <section className="px-6 pb-12 mt-8 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                        <Newspaper className="w-4 h-4 text-white/70" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">More Stories</h2>
                                        <p className="text-xs text-white/50">From {new Date(articleInfo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                <nav className="grid gap-4" aria-label="Related articles">
                                    {relatedPosts.map((relatedPost) => (
                                        <Link
                                            key={relatedPost.slug}
                                            href={`/article/${relatedPost.date || articleInfo.date}/${relatedPost.slug}`}
                                            className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                {relatedPost.thumbnail_url ? (
                                                    <img
                                                        src={relatedPost.thumbnail_url}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-1">
                                                    {relatedPost.topic || 'News'}
                                                </span>
                                                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-2">
                                                    {relatedPost.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-white/40">
                                                    <span className="flex items-center gap-1 text-[10px]">
                                                        <Clock className="w-3 h-3" />
                                                        {relatedPost.readingTime || 1} min
                                                    </span>
                                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </nav>

                                <Link
                                    href="/app/today"
                                    className="flex items-center justify-center gap-2 mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
                                >
                                    View All Headlines
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </section>
                        )}
                    </div>
                </div>

                <FloatingActionDock
                    post={post}
                    hasMoreContent={hasMoreContent}
                    isGeneratingContent={isGeneratingContent}
                    remainingSections={remainingSections}
                    onContinue={() => (window as any).__expandedReaderContinue?.()}
                    onDownload={handleDownload}
                    isExporting={isExporting}
                    visible={!isGeneratingContent}
                    isDarkMode={readerDarkMode}
                />
            </motion.div>
        </AnimatePresence>
    );
}
