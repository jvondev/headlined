'use client';

import React, { useState, useEffect, useCallback, type FC, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ArrowUp, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, ArrowDown, Pencil, HelpCircle, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PostViewPremium as PostView } from "@/components/post-view-premium";
import { PostCardSkeleton } from "./post-card-skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CarouselContext } from "@/context/carousel-context";
import { useOnboardingContext } from "@/context/onboarding-context";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { HomepagePostSlide } from "@/components/homepage-post-slide";
import { getPaginatedPosts } from "@/lib/client-posts";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";

import { SaveDialog } from "./save-dialog";
import { PremiumModal } from "@/components/support/premium-modal";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { Post, SavedItem } from "@/types";

import { useDistractionSettings } from "@/hooks/use-distraction-settings";
import { checkLicenseStatus } from "@/lib/license-manager";
import { SupportButton } from "@/components/support-button";
import { DISTRACTION_FILTERS } from "@/data/distraction-filters";

type PostCarouselProps = {
  shouldFetchPaginatedPosts?: boolean,
  topicName?: string;
  searchQuery?: string;
  posts?: Post[];
  date?: string;
  dateRange?: { start: string; end: string };
  isPremium?: boolean;
}

const PAGE_SIZE = 10; // Define page size for client-side pagination

const PostCarouselComponent: FC<PostCarouselProps> = ({
  shouldFetchPaginatedPosts = false,
  topicName,
  searchQuery,
  posts: externalPosts,
  date,
  dateRange,
  isPremium: initialIsPremium,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const returnToSlug = searchParams.get("returnTo");
  const action = searchParams.get("action");

  const currentKey = useMemo(() => {
    if (topicName) return `topic-${topicName}`;
    if (searchQuery) return `search-${searchQuery}`;
    if (date) return `date-${date}`;
    if (dateRange) return `range-${dateRange.start}-${dateRange.end}`;
    return "default";
  }, [topicName, searchQuery, date, dateRange]);

  const [internalPosts, setInternalPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = useRef(1);
  const nextAdDistance = useRef(Math.floor(Math.random() * 5) + 4); // Random 4-88

  const { enabled: distractionEnabled, keywords: distractionKeywords, presets, validatePresets } = useDistractionSettings();
  const [isPremium, setIsPremium] = useState(initialIsPremium ?? false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    if (initialIsPremium !== undefined) {
      setIsPremium(initialIsPremium);
      validatePresets(initialIsPremium);
    } else {
      checkLicenseStatus().then(status => {
        setIsPremium(status);
        validatePresets(status);
      });
    }
  }, [initialIsPremium, validatePresets]);

  const filterDistractions = useCallback((postsToFilter: Post[]) => {
    return postsToFilter.filter(post => {
      const content = `${post.title} ${post.description || ""} ${post.topic || ""}`.toLowerCase();

      // Check Custom Keywords (Premium Only)
      if (isPremium && distractionEnabled && distractionKeywords.some(keyword => content.includes(keyword.toLowerCase()))) {
        return false;
      }

      // Check Presets (Free: Max 1, Premium: Unlimited)
      let activePresets = Object.entries(presets).filter(([k, v]) => v);

      if (!isPremium && activePresets.length > 1) {
        // Security: User has >1 preset enabled but is free.
        // Only use the first one for filtering.
        activePresets = [activePresets[0]];
      }

      // Check against active presets
      for (const [key, isActive] of activePresets) {
        const filterDef = DISTRACTION_FILTERS.find(f => f.id === key);
        if (filterDef && filterDef.keywords.some(k => content.includes(k))) {
          return false;
        }
      }

      return true;
    });
  }, [distractionEnabled, distractionKeywords, isPremium, presets]);

  // Use external posts if provided, otherwise use internal state
  const rawPosts = externalPosts || internalPosts;

  const posts = useMemo(() => {
    let filtered = filterDistractions(rawPosts);

    // Freemium Search Logic
    if (searchQuery && !isPremium) {
      // 1. Filter for Today's articles only
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];

      const todayPosts = filtered.filter(post => {
        if (!post.date) return false;
        return post.date === todayStr;
      });

      // 2. Limit to 3 articles
      const limitedPosts = todayPosts.slice(0, 3);

      // 3. Append CTA if needed
      if (filtered.length > 3 || todayPosts.length < filtered.length) {
        const ctaPost: Post = {
          slug: 'search-limit-cta',
          title: 'Unlock All Results',
          description: 'Upgrade to Premium to see all search results and access the full archive.',
          link: '/support',
          thumbnail_url: null,
          topic: 'Premium',
          summaries: [],
          date: todayStr
        };
        return [...limitedPosts, ctaPost];
      }

      return limitedPosts;
    }

    return filtered;
  }, [rawPosts, filterDistractions, searchQuery, isPremium]);

  // Lazy Loading State
  const [hasActivated, setHasActivated] = useState(shouldFetchPaginatedPosts || !!externalPosts);

  useEffect(() => {
    if (shouldFetchPaginatedPosts || externalPosts) {
      setHasActivated(true);
    }
  }, [shouldFetchPaginatedPosts, externalPosts]);

  const createNativeAdPost = useCallback((): Post => {
    return {
      slug: `ad-native-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Sponsored Content',
      description: 'Sponsored',
      link: '#',
      thumbnail_url: null,
      topic: 'Sponsored',
      summaries: [],
      date: new Date().toISOString().split('T')[0]
    };
  }, []);

  const injectAds = useCallback((newPosts: Post[]) => {
    if (isPremium) return newPosts;

    const postsWithAds: Post[] = [];

    for (const post of newPosts) {
      postsWithAds.push(post);
      nextAdDistance.current -= 1;

      if (nextAdDistance.current <= 0) {
        postsWithAds.push(createNativeAdPost());
        // Reset distance to random 4-8
        nextAdDistance.current = Math.floor(Math.random() * 5) + 4;
      }
    }
    return postsWithAds;
  }, [createNativeAdPost, isPremium]);

  const fetchPosts = useCallback(async () => {
    if (isLoading || externalPosts) return; // Skip fetch if external posts provided

    setIsLoading(true);
    setError(null);

    try {
      const { posts: newPosts, hasMore: newHasMore } = await getPaginatedPosts({
        page: 1,
        topic_name: topicName,
        search_query: searchQuery,
        date,
        dateRange,
        refreshOrder: true,
      });

      setInternalPosts(injectAds(newPosts));
      setHasMore(newHasMore);
      page.current = 1;
    } catch (err: any) {
      console.error("Error fetching posts:", err.message);
      setError("Failed to load posts.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, topicName, searchQuery, externalPosts, date, dateRange, injectAds]);

  useEffect(() => {
    if (hasActivated && !externalPosts) {
      setInternalPosts([]);
      setHasMore(false);
      page.current = 1;
      setActiveSlideIndex(0);
      fetchPosts();
    }
  }, [currentKey, hasActivated, externalPosts]);

  // Prevent iOS bounce on body and browser navigation swipes
  useEffect(() => {
    if (!hasActivated) return;
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, [hasActivated]);

  const initialSlide = useMemo(() => {
    return 0;
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: 'y',
    startIndex: initialSlide,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'y',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlide);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const currentPost = posts[activeSlideIndex];

  const { toast } = useToast();
  const { setVerticalEmblaApi } = useOnboardingContext();

  useEffect(() => {
    if (emblaApi && hasActivated) {
      setVerticalEmblaApi(emblaApi);
    }
    return () => {
      setVerticalEmblaApi(null);
    };
  }, [emblaApi, setVerticalEmblaApi, hasActivated]);

  const { isSaved, getSavedItem, addSavedItem, removeSavedItem, hasSaved, setHasSaved } = useSavedItems();


  const scrollUp = useCallback(() => {
    if (emblaApi && emblaApi!.canScrollPrev()) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollDown = useCallback(() => {
    if (emblaApi && emblaApi!.canScrollNext()) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);


  useEffect(() => {
    if (!hasActivated) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          scrollDown();
          break;
        case "ArrowUp":
          scrollUp();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollDown, scrollUp, currentPost, hasActivated]);


  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore || externalPosts) return; // Disable load more for external posts for now

    setIsLoading(true);
    page.current += 1;

    const { posts: newPosts, hasMore: newHasMore } = await getPaginatedPosts({
      page: page.current,
      topic_name: topicName, // Use topicName prop
      search_query: searchQuery, // Use searchQuery prop
      date,
      dateRange,
    });

    if (newPosts.length > 0) {
      setInternalPosts(prev => {
        const postsWithAds = injectAds(newPosts);
        const updatedPosts = [...prev, ...postsWithAds];
        return updatedPosts;
      });
    }
    setHasMore(newHasMore);
    setIsLoading(false);
  }, [isLoading, hasMore, topicName, searchQuery, externalPosts, date, dateRange, injectAds]);


  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const applyTransforms = () => {
      const scrollProgress = emblaApi.scrollProgress();
      const slides = emblaApi.slideNodes();
      const snapList = emblaApi.scrollSnapList();

      slides.forEach((slide, index) => {
        const snap = snapList[index];
        const diffToTarget = snap - scrollProgress;

        if (Math.abs(diffToTarget) > 2) {
          slide.style.opacity = '0';
          slide.style.pointerEvents = 'none';
          return;
        }

        slide.style.pointerEvents = 'auto';
        const scale = 1 - Math.abs(diffToTarget * 0.9); // Scale down by 90% at the edges
        const translateY = diffToTarget * 300; // Adjust vertical position
        const zIndex = Math.round(20 - Math.abs(diffToTarget * 10));

        slide.style.transform = `scale(${scale}) translateY(${translateY}px) translateZ(0)`;
        slide.style.opacity = Math.max(0, 1 - Math.abs(diffToTarget * 1.5)).toString();
        slide.style.zIndex = zIndex.toString();
        slide.style.position = 'relative';
      });
    };

    emblaApi.on("scroll", applyTransforms);
    emblaApi.on("reInit", applyTransforms);
    applyTransforms(); // Apply initial transforms

    return () => {
      emblaApi.off("scroll", applyTransforms);
      emblaApi.off("reInit", applyTransforms);
    };
  }, [emblaApi, posts.length, hasActivated]);

  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const onSelect = (api: UseEmblaCarouselType[1]) => {
      const newIndex = api!.selectedScrollSnap();
      setActiveSlideIndex(newIndex);

      if (hasMore && !isLoading && newIndex >= posts.length - 5) {
        loadMorePosts();
      }
    };

    emblaApi.on("select", onSelect);
    // Initial check
    onSelect(emblaApi);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, hasMore, isLoading, posts.length, loadMorePosts, topicName, searchQuery, hasActivated, date, dateRange]);




  const handleCategoryChange = (category: string) => {

  };

  const currentItemId = useMemo(() => {
    if (!currentPost) return '';
    return `${currentPost.slug}-post`;
  }, [currentPost]);

  // When the active item changes, close the save dialog to prevent state bleeding.
  useEffect(() => {
    if (isSaveDialogOpen) {
      setIsSaveDialogOpen(false);
    }
  }, [currentItemId]);

  // State for save count
  const [saveCount, setSaveCount] = useState(0);

  const handleSaveWithNote = (item: Omit<SavedItem, 'savedAt'>) => {
    addSavedItem(item);
    toast({ title: "Saved!", description: "Your item and note have been saved." });
    if (!hasSaved(item.id)) {
      setHasSaved(item.id, true);
    }
  };

  const handleRemoveFromSaved = (id: string) => {
    removeSavedItem(id);
    toast({ title: "Removed", description: "Removed from your saved items." });
    if (hasSaved(id)) {
      setHasSaved(id, false);
    }
  }

  const isCurrentItemSaved = isSaved(currentItemId);
  const currentSavedItem = getSavedItem(currentItemId);

  const itemToSave = useMemo(() => {
    if (!currentPost) return null;
    let item: Omit<SavedItem, 'savedAt' | 'note' | 'postData'>;

    item = {
      id: `${currentPost.slug}-post`,
      slug: currentPost.slug,
      title: currentPost.title,
      type: 'post',
    };
    return item;
  }, [currentPost]);

  const handleSaveClick = async () => {
    if (!itemToSave) return;

    let fullItemData: Omit<SavedItem, 'savedAt' | 'note'>;

    fullItemData = { ...itemToSave, postData: currentPost };

    if (isCurrentItemSaved) {
      setIsSaveDialogOpen(true);
    } else {
      addSavedItem(fullItemData);
      toast({ title: "Saved!", description: "Added to your saved items." });
      if (!hasSaved(fullItemData.id)) {
        setHasSaved(fullItemData.id, true);
      }
    }
  };

  const renderContent = () => {
    if (isLoading && posts.length === 0) {
      return <PostPageLoadingSkeleton />;
    }
    if (error) {
      return (
        <div className="text-center text-red-500 py-16">
          <h1 className="font-headline text-4xl font-bold">Error</h1>
          <p className="mt-2 text-lg text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (posts.length === 0) {
      if ((date || dateRange) && !isPremium) {
        return (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto px-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8 group cursor-pointer" onClick={() => setShowSupportModal(true)}>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-background to-muted rounded-2xl border border-border/50 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-50" />
                <HelpCircle className="w-10 h-10 text-primary relative z-10" />
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-3">
              Unlock Your Posts History
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Support ReadMore+ to access your complete posts history.
            </p>

            <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[200px]">
              <SupportButton
                onClick={() => setShowSupportModal(true)}
                className="w-full h-12 text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              />
              <Button
                onClick={() => router.push('/today')}
                variant="ghost"
                className="w-full hover:bg-muted/50 transition-colors"
              >
                Back to Today
              </Button>
            </div>

            <PremiumModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
          </div>
        );
      }

      return (
        <div className="text-center py-16">
          <h1 className="font-headline text-4xl font-bold">No Posts Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">No posts found for this selection.</p>
        </div>
      );
    }

    return (
      <>
        {posts.map((post, index) => {
          // Virtualization: Only render slides within a buffer of the active index
          // This drastically reduces DOM weight and React reconciliation cost
          const shouldRender = Math.abs(index - activeSlideIndex) <= 3;

          return (
            <div
              className="relative min-w-0 flex-[0_0_100%] h-full flex justify-center py-2 px-4 md:py-4 md:px-8 lg:py-8 lg:px-16 will-change-[transform,opacity] transition-transform transition-opacity duration-200 ease-out"
              key={`${post.slug}-${index}-${topicName || searchQuery}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Post ${index + 1} of ${posts.length}`}
            >
              {shouldRender ? (
                post.slug === "home" ? (
                  <HomepagePostSlide />
                ) : post.slug === 'search-limit-cta' ? (
                  <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh] flex items-center justify-center p-4">
                    <Card className="max-w-md w-full bg-card/90 backdrop-blur-xl border-primary/20 rounded-3xl p-8 shadow-2xl text-center space-y-8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-secondary/5" />

                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-secondary/25 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                          <Sparkles className="w-10 h-10 text-primary drop-shadow-md" />
                        </div>

                        <h2 className="text-3xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                          Unlock All Results
                        </h2>
                        <p className="text-muted-foreground text-md mb-8 leading-relaxed font-small">
                          Free search is limited to 3 results. <br />
                          Support independent creators.
                        </p>

                        <SupportButton
                          onClick={() => setShowSupportModal(true)}
                          className="w-full h-14 text-xl font-bold shadow-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-primary border-none"
                        />

                        <Button
                          variant="ghost"
                          className="w-full mt-4 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push('/today')}
                        >
                          Back to Today
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : post.slug.startsWith('ad-') ? (
                  <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh] pointer-events-none">
                    <motion.div
                      className="relative w-full h-full rounded-[28px] overflow-hidden group"
                      whileHover={{ scale: 0.985, y: -2 }}
                      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {/* Premium Glow Effect - Monochrome */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />

                      {/* Main Card Container */}
                      <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-gradient-to-br from-zinc-900 to-black shadow-2xl border border-white/5 pointer-events-none">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />

                          {/* Multi-layer Gradients */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/3 via-transparent to-white/2" />
                        </div>

                        {/* Card Content */}
                        <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-10 pointer-events-none">
                          <div className="space-y-5 pt-2">
                            {/* Sponsored Label */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-semibold text-white tracking-wide uppercase shadow-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Sponsored
                              </span>
                            </div>

                            {/* Ad Container - Full height to fill card */}
                            <div className="absolute inset-0 flex items-center justify-center p-7 md:p-10 pointer-events-none">
                              <div {...{ 'ta-ad-container': '' }} className="w-full h-full flex items-center justify-center relative pointer-events-auto rounded-2xl" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                    <PostView
                      post={post}
                      isActive={index === activeSlideIndex}
                      emblaApi={emblaApi}
                      isLocked={false}
                      isPremium={isPremium}
                      onSave={() => {
                        if (hasSaved(post.slug)) {
                          handleRemoveFromSaved(post.slug);
                        } else {
                          setIsSaveDialogOpen(true);
                        }
                      }}
                      isSaved={hasSaved(post.slug)}
                      onShare={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: post.title,
                            text: post.description || undefined,
                            url: post.link,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(post.link);
                          toast({ title: "Copied", description: "Link copied to clipboard" });
                        }
                      }}
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                  <PostCardSkeleton />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Loading more...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Lazy Loading Placeholder
  if (!hasActivated) {
    return <div className="w-full h-full" />;
  }

  if (!currentPost && posts.length > 0) {
    return null;
  }

  const SaveIcon = isCurrentItemSaved ? Pencil : Bookmark;
  const saveIconClassName = isCurrentItemSaved ? 'fill-current' : '';

  return (
    <CarouselContext.Provider value={{ currentPostSlug: currentPost?.slug }}>
      <div className="relative flex h-full w-full flex-col items-center justify-center">

        <div className="overflow-hidden h-full w-full touch-none overscroll-y-none overscroll-contain" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Posts Carousel">
          <div className="flex flex-col h-full backface-visibility-hidden">
            {renderContent()}
          </div>
        </div>

        {itemToSave && (
          <SaveDialog
            open={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
            itemToSave={itemToSave}
            initialNote={currentSavedItem?.note}
            onSave={handleSaveWithNote}
            onRemove={handleRemoveFromSaved}
          />
        )}

        <PremiumModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
      </div>
    </CarouselContext.Provider>
  );
};

export const PostCarousel = React.memo(PostCarouselComponent);
export const SynchronizedCarousel = PostCarousel;