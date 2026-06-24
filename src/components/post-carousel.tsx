'use client';

import React, { useState, useEffect, useCallback, type FC, useRef, useMemo } from "react";
// PERFORMANCE: Removed framer-motion - using CSS transitions instead
import useEmblaCarousel from "embla-carousel-react";
// Custom wheel handler instead of WheelGesturesPlugin - more predictable
import { ArrowUp, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, ArrowDown, Pencil, HelpCircle, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PostView } from "@/components/post-view";
import { PostCardSkeleton } from "./post-card-skeleton";
// PERFORMANCE: Removed useIsMobile - was unused but caused re-renders
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

import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { Post, SavedItem } from "@/types";



type PostCarouselProps = {
  shouldFetchPaginatedPosts?: boolean,
  topicName?: string;
  searchQuery?: string;
  posts?: Post[];
  date?: string;
  dateRange?: { start: string; end: string };
  topComponent?: React.ReactNode;
  topComponentPadding?: boolean;
}

const PAGE_SIZE = 10; // Define page size for client-side pagination

const PostCarouselComponent: FC<PostCarouselProps> = ({
  shouldFetchPaginatedPosts = false,
  topicName,
  searchQuery,
  posts: externalPosts,
  date,
  dateRange,
  topComponent,
  topComponentPadding = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // PERFORMANCE: Removed useIsMobile hook call - was unused
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

  const rawPosts = externalPosts || internalPosts;
  const posts = useMemo(() => {
    return rawPosts;
  }, [rawPosts]);

  // Lazy Loading State
  const [hasActivated, setHasActivated] = useState(shouldFetchPaginatedPosts || !!externalPosts);

  useEffect(() => {
    if (shouldFetchPaginatedPosts || externalPosts) {
      setHasActivated(true);
    }
  }, [shouldFetchPaginatedPosts, externalPosts]);



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

      setInternalPosts(newPosts);
      setHasMore(newHasMore);
      page.current = 1;
    } catch (err: any) {
      console.error("Error fetching posts:", err.message);
      setError("Failed to load posts.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, topicName, searchQuery, externalPosts, date, dateRange]);

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

  // TIKTOK-STYLE SCROLL: Instant snap, native Embla only (no plugins)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: 'y',
    startIndex: initialSlide,
    duration: 15, // Ultra-fast snap animation
    skipSnaps: false, // Never skip slides
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlide);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Correct indexing: if topComponent exists, posts start at index 1
  const currentPost = topComponent
    ? (activeSlideIndex === 0 ? undefined : posts[activeSlideIndex - 1])
    : posts[activeSlideIndex];

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

  // HYBRID LOGIC: Cooldown + Velocity Check
  // Solves "Triple Swipe" / "Ghost Triggers"
  // 1. Hard Lock (300ms) prevents rapid-fire.
  // 2. Velocity Check (>1.5x previous) prevents momentum tail from re-triggering.
  const isLocked = useRef(false);
  const lockTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastAbsDelta = useRef(0);

  useEffect(() => {
    // 1. SKIP ON MOBILE/TOUCH DEVICES
    // Zero overhead for mobile users. Logic only runs if user has a fine pointer (mouse/trackpad).
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    if (!emblaApi || !hasActivated) return;

    const container = emblaApi.rootNode();
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Logic remains the same, but now guarded by isTouchDevice check above
      e.stopPropagation();
      e.preventDefault();

      const absDelta = Math.abs(e.deltaY);
      const prevDelta = lastAbsDelta.current;
      lastAbsDelta.current = absDelta;

      // 1. HARD LOCK: Ignore everything during cooldown
      if (isLocked.current) return;

      // 2. TRIGGER LOGIC:
      // A) Must be strong (>20)
      // B) Must be ACCELERATING (>1.2x previous) to prove it's a new finger flick
      //    (Momentum tails are always DECELERATING, so they will fail this check)
      if (absDelta > 20 && absDelta > prevDelta * 1.2) {
        // Trigger
        if (e.deltaY > 0) emblaApi.scrollNext();
        else emblaApi.scrollPrev();

        // Lock for 350ms
        isLocked.current = true;

        lockTimeout.current = setTimeout(() => {
          isLocked.current = false;
        }, 350);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [emblaApi, hasActivated]);

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
        const updatedPosts = [...prev, ...newPosts];
        return updatedPosts;
      });
    }
    setHasMore(newHasMore);
    setIsLoading(false);
  }, [isLoading, hasMore, topicName, searchQuery, externalPosts, date, dateRange]);


  // TIKTOK-STYLE: Simple visibility toggle - no complex transforms during scroll
  // TikTok doesn't scale/rotate cards - it just snaps instantly to next slide
  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const updateVisibility = () => {
      const slides = emblaApi.slideNodes();
      const selectedIndex = emblaApi.selectedScrollSnap();

      // Simple visibility: show current ±1, hide rest
      slides.forEach((slide, index) => {
        const distance = Math.abs(index - selectedIndex);

        if (distance > 1) {
          // Far slides: completely hidden
          slide.style.opacity = '0';
          slide.style.pointerEvents = 'none';
        } else {
          // Current and adjacent slides: visible
          slide.style.opacity = '1';
          slide.style.pointerEvents = distance === 0 ? 'auto' : 'none';
        }
        slide.style.transform = 'translateZ(0)';
      });
    };

    emblaApi.on("select", updateVisibility);
    emblaApi.on("reInit", updateVisibility);
    updateVisibility();

    return () => {
      emblaApi.off("select", updateVisibility);
      emblaApi.off("reInit", updateVisibility);
    };
  }, [emblaApi, posts.length, hasActivated, topComponent]);

  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const onSelect = (api: UseEmblaCarouselType[1]) => {
      const newIndex = api!.selectedScrollSnap();
      setActiveSlideIndex(newIndex);

      const totalSlides = posts.length + (topComponent ? 1 : 0);
      if (hasMore && !isLoading && newIndex >= totalSlides - 5) {
        loadMorePosts();
      }
    };

    emblaApi.on("select", onSelect);
    // Initial check
    onSelect(emblaApi);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, hasMore, isLoading, posts.length, loadMorePosts, topicName, searchQuery, hasActivated, date, dateRange, topComponent]);




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


      return (
        <div className="text-center py-16">
          <h1 className="font-headline text-4xl font-bold">No Posts Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">No posts found for this selection.</p>
        </div>
      );
    }

    return (
      <>
        {topComponent && (
          <div
            className={cn(
              "relative min-w-0 flex-[0_0_100%] h-full flex justify-center carousel-slide",
              topComponentPadding ? "py-2 px-4 md:py-4 md:px-8 lg:py-8 lg:px-16" : ""
            )}
            key="top-component"
            role="group"
          >
            {topComponent}
          </div>
        )}
        {posts.map((post, index) => {
          const actualIndex = topComponent ? index + 1 : index;
          const shouldRender = Math.abs(actualIndex - activeSlideIndex) <= 2;

          return (
            <div
              className="relative min-w-0 flex-[0_0_100%] h-full flex justify-center py-2 px-4 md:py-4 md:px-8 lg:py-8 lg:px-16 carousel-slide"
              key={`${post.slug}-${index}-${topicName || searchQuery}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Post ${index + 1} of ${posts.length}`}
            >
              {shouldRender ? (
                post.slug === "home" ? (
                  <HomepagePostSlide />

                ) : (
                  <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                    <PostView
                      post={post}
                      emblaApi={emblaApi}
                      isLocked={false}
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

  // Removed the null return that caused blank screens when indexing was off
  // if (!currentPost && posts.length > 0) {
  //   return null;
  // }

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

export const PostCarousel = React.memo(PostCarouselComponent);
export const SynchronizedCarousel = PostCarousel;