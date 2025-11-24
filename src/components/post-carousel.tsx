'use client';

import { useState, useEffect, useCallback, type FC, useRef, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ArrowUp, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, ArrowDown, Pencil, HelpCircle, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { CarouselContext } from "@/context/carousel-context";
import { useOnboardingContext } from "@/context/onboarding-context";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PostView } from "@/components/post-view";
import { PostCardSkeleton } from "./post-card-skeleton";
import { HomepagePostSlide } from "@/components/homepage-post-slide";
import { getPaginatedPosts } from "@/lib/client-posts";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

import { SaveDialog } from "./save-dialog";
import { PremiumModal } from "@/components/support/premium-modal";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { Post, SavedItem } from "@/types";
import { affiliateAds, AffiliateProgram } from "@/data/affiliate-ads";
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

export const PostCarousel: FC<PostCarouselProps> = ({
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
  const nextAdDistance = useRef(Math.floor(Math.random() * 5) + 5); // Initial random range 5-10

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

  const createAdPost = useCallback((program: AffiliateProgram): Post => {
    const variant = program.variants[Math.floor(Math.random() * program.variants.length)];
    return {
      slug: `ad-${program.name}-${Math.random().toString(36).substr(2, 9)}`,
      title: variant.title,
      description: variant.description,
      link: variant.link,
      thumbnail_url: variant.asset,
      topic: "Sponsored",
      summaries: [{
        type: 'article-summary',
        title: 'Summary',
        icon: 'Info',
        content: {
          snippet: variant.description,
          originalArticleUrl: variant.link,
          slug: `ad-summary-${Math.random()}`
        }
      }]
    };
  }, []);

  const injectAds = useCallback((newPosts: Post[]) => {
    const postsWithAds: Post[] = [];

    // Filter ads relevant to current topic/interest
    const relevantAds = affiliateAds.filter(ad => {
      if (topicName && ad.topics && !ad.topics.includes(topicName)) return false;
      if (searchQuery && ad.interests && !ad.interests.includes(searchQuery)) return false;
      return true;
    });

    if (relevantAds.length === 0) return newPosts;

    for (const post of newPosts) {
      postsWithAds.push(post);
      nextAdDistance.current -= 1;

      if (nextAdDistance.current <= 0) {
        const randomAd = relevantAds[Math.floor(Math.random() * relevantAds.length)];
        const min = randomAd.frequency?.min || 5;
        const max = randomAd.frequency?.max || 10;

        postsWithAds.push(createAdPost(randomAd));
        nextAdDistance.current = Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }
    return postsWithAds;
  }, [topicName, searchQuery, createAdPost]);

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
  }, [isLoading, topicName, searchQuery, injectAds, externalPosts, date, dateRange]);

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
  }, [isLoading, hasMore, topicName, searchQuery, injectAds, externalPosts, date, dateRange]);


  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const applyTransforms = () => {
      const scrollProgress = emblaApi.scrollProgress();
      const slides = emblaApi.slideNodes();
      const snapList = emblaApi.scrollSnapList();

      slides.forEach((slide, index) => {
        const snap = snapList[index];
        const diffToTarget = snap - scrollProgress;
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
          const shouldRender = Math.abs(index - activeSlideIndex) <= 5;

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
                    <div className="max-w-md w-full bg-card/90 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 shadow-2xl text-center space-y-8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent opacity-50" />

                      <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                          <Sparkles className="w-12 h-12 text-primary drop-shadow-md" />
                        </div>

                        <h2 className="text-4xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                          Unlock Everything
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-medium">
                          You've hit the daily limit. <br />
                          Support independent creators and get unlimited access to all search results.
                        </p>

                        <SupportButton
                          onClick={() => setShowSupportModal(true)}
                          className="w-full h-16 text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 border-none"
                        />

                        <Button
                          variant="ghost"
                          className="w-full mt-4 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push('/today')}
                        >
                          Back to Today
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                    <PostView
                      post={post}
                      isActive={index === activeSlideIndex}
                      emblaApi={emblaApi}
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
      </div>
    </CarouselContext.Provider>
  );
};

export const SynchronizedCarousel = PostCarousel;