
"use client";

import type { Insight, SavedItem } from "@/types";
import { useState, useEffect, useCallback, type FC, useRef, useMemo, useTransition } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ArrowUp, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, ArrowDown, ArrowRight, Pencil, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { CarouselContext } from "@/context/carousel-context";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { OnboardingContext } from "@/context/onboarding-context";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { PageHeader } from "./shared/page-header";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { InsightView } from "@/components/insight-view";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { getPaginatedInsights /*, getSaveCount, updateSaveCount*/ } from "@/lib/actions";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { usePreferences } from "@/hooks/use-preferences";
import { SaveDialog } from "./save-dialog";
import { getInsightBySlug } from "@/lib/insights";
import { InsightPageLoadingSkeleton } from "@/components/insight-page-loading-skeleton";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";


type InsightCarouselProps = {
  initialInsights: Insight[], 
  initialSlug: string, 
  startOnDeepDive?: boolean, 
  initialDeepDiveIndex?: number,
  rssCategories?: string[],
  rssSelectedCategory?: string,
  initialHasMore: boolean,
  hasSeenOnboarding: boolean,
  markOnboardingComplete: () => void,
  shouldFetchPaginatedInsights?: boolean,
}

// Function to inject ads into the insight list
const injectAds = (insights: Insight[]): Insight[] => {
  const newInsightsWithAds: Insight[] = [];
  let lastAdIndex = -1;

  insights.forEach((insight, index) => {
    newInsightsWithAds.push(insight);
    const distanceSinceLastAd = index - lastAdIndex;
    
    // Check if it's time to potentially insert an ad
    if (distanceSinceLastAd >= 4) {
      // Randomly decide to insert an ad (e.g., 50% chance after 4 slides)
      // or definitely insert if distance is 8 or more
      const shouldInsertAd = Math.random() < 0.5 || distanceSinceLastAd >= 8;
      
      if (shouldInsertAd) {
        newInsightsWithAds.push({
          isAd: true,
          slug: `ad-${index}`, // Unique slug for the ad
          // Fill with dummy data to satisfy the Insight type
          seo: { title: 'Advertisement', description: '' },
          category: [],
          title: 'Advertisement',
          description: '',
          deepDives: [],
          blogContent: '',
        });
        lastAdIndex = index;
      }
    }
  });

  return newInsightsWithAds;
};

export const InsightCarousel: FC<InsightCarouselProps> = ({ 
  initialInsights, 
  initialSlug, 
  startOnDeepDive = false, 
  initialDeepDiveIndex = 0,
  rssCategories,
  rssSelectedCategory,
  initialHasMore,
  shouldFetchPaginatedInsights = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const returnToSlug = searchParams.get("returnTo");
  const action = searchParams.get("action");

  // State initialization on client side to avoid hydration issues
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { subscribedFeeds, isLoaded: isSubscribedFeedsLoaded } = useSubscribedFeeds();

  useEffect(() => {
    setIsClient(true);
    // Initialize with ads on client mount
    if (isSubscribedFeedsLoaded) {
      const filteredInsights = subscribedFeeds.length > 0
        ? initialInsights.filter(insight => subscribedFeeds.includes(insight.originalFeedUrl ?? ''))
        : initialInsights; // If no feeds subscribed, show all
      setInsights(injectAds(filteredInsights));
    }
  }, [initialInsights, isSubscribedFeedsLoaded, subscribedFeeds]);

  useEffect(() => {
    // This effect runs when initialInsights prop changes on the client.
    if (isClient && isSubscribedFeedsLoaded) {
      const filteredInsights = subscribedFeeds.length > 0
        ? initialInsights.filter(insight => subscribedFeeds.includes(insight.originalFeedUrl ?? ''))
        : initialInsights; // If no feeds subscribed, show all
      const insightsWithAds = injectAds(filteredInsights);
      setInsights(insightsWithAds);
    }
  }, [initialInsights, isClient, isSubscribedFeedsLoaded, subscribedFeeds]);


  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const page = useRef(1);

  const { preferences, addPreference, isLoaded: isPreferencesLoaded } = usePreferences();

  const initialSlide = useMemo(() => {
    if (insights.length === 0) return 0;
    const index = insights.findIndex(insight => insight.slug === initialSlug);
    return Math.max(0, index);
  }, [insights, initialSlug]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    axis: 'y',
    startIndex: initialSlide,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'y',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlide);
  const horizontalApis = useRef<Map<string, UseEmblaCarouselType[1] | null>>(new Map());
  const [activeDeepDiveIndex, setActiveDeepDiveIndex] = useState(startOnDeepDive ? initialDeepDiveIndex : -1);
  const [isPreferenceSheetOpen, setIsPreferenceSheetOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  // const [isUpdatingCount, startCountTransition] = useTransition();
  
  const currentInsight = insights[activeSlideIndex];

  const { toast } = useToast();
  const [isEmblaApiReady, setIsEmblaApiReady] = useState(false);
  const [onboardingActive, setOnboardingActive] = useState(false); // State for setOnboardingActive

  useEffect(() => {
    if (emblaApi) {
      setIsEmblaApiReady(true);
    }
  }, [emblaApi]);

  const setOnboardingActiveCallback = useCallback((active: boolean) => {
    setOnboardingActive(active);
  }, []);
  const { isSaved, getSavedItem, addSavedItem, removeSavedItem, hasSaved, setHasSaved } = useSavedItems();
  const { resetOnboarding, hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus(); // Add this line
  
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

  const scrollLeft = useCallback(() => {
    const horizontalApi = horizontalApis.current.get(currentInsight?.slug);
    if(horizontalApi && horizontalApi.canScrollPrev()) {
      horizontalApi.scrollPrev();
    }
  }, [currentInsight]);

  const scrollRight = useCallback(() => {
    const horizontalApi = horizontalApis.current.get(currentInsight?.slug);
    if(horizontalApi && horizontalApi.canScrollNext()) {
        horizontalApi.scrollNext();
    }
  }, [currentInsight]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          scrollDown();
          break;
        case "ArrowUp":
          scrollUp();
          break;
        case "ArrowRight":
          scrollRight();
          break;
        case "ArrowLeft":
          scrollLeft();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollDown, scrollUp, scrollRight, scrollLeft]);


  useEffect(() => {
    if (action === 'next' && emblaApi) {
        scrollDown();
        const newPath = pathname.split('?')[0];
        router.replace(newPath, { scroll: false });
    }
  }, [action, emblaApi, scrollDown, pathname, router]);


  const handleBackToBlog = useCallback(() => {
    if (returnToSlug) {
        const isRss = returnToSlug.startsWith('rss-');
        const blogPath = isRss ? `/blog/rss/${returnToSlug.replace('rss-', '')}` : `/blog/${returnToSlug}`;
        router.push(`${blogPath}?from=backtoblog`);
    } else {
        router.back();
    }
  }, [router, returnToSlug]);


  const loadMoreInsights = useCallback(async () => {
    console.log('loadMoreInsights called');
    if (isLoading || !hasMore || !isPreferencesLoaded) return;
    
    setIsLoading(true);
    page.current += 1;
    
    const category = rssSelectedCategory || searchParams.get("category");
    const isRss = !!rssSelectedCategory;

    const { insights: newInsights, hasMore: newHasMore } = await getPaginatedInsights({
      page: page.current,
      category: category || undefined,
      isRss,
      preferences: isRss ? {} : preferences, // Only apply preferences to non-RSS feeds
    });

    const filteredNewInsights = subscribedFeeds.length > 0
      ? newInsights.filter(insight => subscribedFeeds.includes(insight.originalFeedUrl ?? ''))
      : newInsights; // If no feeds subscribed, show all

    if (filteredNewInsights.length > 0) {
      setInsights(prev => [...prev, ...injectAds(filteredNewInsights)]);
    }
    setHasMore(newHasMore);
    setIsLoading(false);
  }, [isLoading, hasMore, searchParams, rssSelectedCategory, preferences, isPreferencesLoaded]);
  

  useEffect(() => {
    if (!isClient) return;

    const insightsWithAds = injectAds(initialInsights);
    setInsights(insightsWithAds);
    setHasMore(initialHasMore);
    page.current = 1;

    if (emblaApi) {
        const newStartIndex = insightsWithAds.findIndex(i => i.slug === initialSlug);
        const safeStartIndex = Math.max(0, newStartIndex);
        // Using reInit with a timeout to avoid race conditions with state updates
        setTimeout(() => emblaApi.reInit({ startIndex: safeStartIndex }), 0);
        setActiveSlideIndex(safeStartIndex);
    }
  }, [initialInsights, initialSlug, initialHasMore, emblaApi, isClient]);


  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = (api: UseEmblaCarouselType[1]) => {
        const newIndex = api!.selectedScrollSnap();
        setActiveSlideIndex(newIndex);
        
        if (hasMore && !isLoading && newIndex >= insights.length - 3) {
            loadMoreInsights();
        }
    };

    emblaApi.on("settle", onSettle);
    
    return () => {
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, hasMore, isLoading, insights.length, loadMoreInsights]);


   const setHorizontalEmblaApi = useCallback((slug: string, api: UseEmblaCarouselType[1]) => {
    horizontalApis.current.set(slug, api);
    
    const onSettle = (apiInstance: UseEmblaCarouselType[1]) => {
      // The first slide is the main insight, so deep dives start at index 1 in the carousel.
      const deepDiveIdx = apiInstance!.selectedScrollSnap() - 1;
      setActiveDeepDiveIndex(deepDiveIdx);
    }
    
    if (api) {
      api.on('settle', onSettle);
    }
    
    return () => {
      if (api) {
        api.off('settle', onSettle);
      }
      horizontalApis.current.delete(slug);
    };
   }, []);

  const handleCategoryChange = (category: string) => {
    
  };

  const currentItemId = useMemo(() => {
    if (!currentInsight || currentInsight.isAd) return '';
    if (activeDeepDiveIndex < 0) {
      return `${currentInsight.slug}-insight`;
    }
    return `${currentInsight.slug}-dd-${activeDeepDiveIndex}`;
  }, [currentInsight, activeDeepDiveIndex]);

  // When the active item changes, close the save dialog to prevent state bleeding.
  useEffect(() => {
    if (isSaveDialogOpen) {
      setIsSaveDialogOpen(false);
    }
  }, [currentItemId]);

  // State for save count
  const [saveCount, setSaveCount] = useState(0);

  // Effect to fetch save count when the active item changes
  /*
  useEffect(() => {
    if (currentItemId) {
      getSaveCount(currentItemId).then(setSaveCount);
    }
  }, [currentItemId]);
  */


  const handleSaveWithNote = (item: Omit<SavedItem, 'savedAt'>) => {
    addSavedItem(item);
    toast({ title: "Saved!", description: "Your item and note have been saved." });
    if (!hasSaved(item.id)) {
        setHasSaved(item.id, true);
        /*
        startCountTransition(() => {
            updateSaveCount(item.id, 'increment').then(setSaveCount);
        });
        */
    }
  };
  
  const handleRemoveFromSaved = (id: string) => {
    removeSavedItem(id);
    toast({ title: "Removed", description: "Removed from your saved items." });
    if (hasSaved(id)) {
        setHasSaved(id, false);
        /*
        startCountTransition(() => {
            updateSaveCount(id, 'decrement').then(setSaveCount);
        });
        */
    }
  }
  
  const isCurrentItemSaved = isSaved(currentItemId);
  const currentSavedItem = getSavedItem(currentItemId);

  const itemToSave = useMemo(() => {
    if (!currentInsight || currentInsight.isAd) return null;
    let item: Omit<SavedItem, 'savedAt' | 'note' | 'insightData'>;

    if (activeDeepDiveIndex < 0) {
      item = {
        id: `${currentInsight.slug}-insight`,
        slug: currentInsight.slug,
        title: currentInsight.title,
        type: 'insight',
        deepDiveIndex: -1,
      };
    } else {
      const deepDive = currentInsight.deepDives[activeDeepDiveIndex];
      if (!deepDive) return null;
      item = {
        id: `${currentInsight.slug}-dd-${activeDeepDiveIndex}`,
        slug: currentInsight.slug,
        title: deepDive.title,
        type: deepDive.type,
        deepDiveIndex: activeDeepDiveIndex,
      };
    }
    return item;
  }, [currentInsight, activeDeepDiveIndex]);

  const handleSaveClick = async () => {
    if (!itemToSave) return;

    let fullItemData: Omit<SavedItem, 'savedAt' | 'note'>;

    if (currentInsight.slug.startsWith('rss-')) {
        const fullInsight = await getInsightBySlug(currentInsight.slug);
        if (!fullInsight) {
            toast({ title: "Error", description: "Could not fetch full article to save."});
            return;
        }
        fullItemData = { ...itemToSave, insightData: fullInsight };
    } else {
        fullItemData = { ...itemToSave, insightData: currentInsight };
    }

    if (isCurrentItemSaved) {
        setIsSaveDialogOpen(true);
    } else {
        addSavedItem(fullItemData);
        toast({ title: "Saved!", description: "Added to your saved items." });
        if (!hasSaved(fullItemData.id)) {
            setHasSaved(fullItemData.id, true);
            /*
            startCountTransition(() => {
                updateSaveCount(fullItemData.id, 'increment').then(setSaveCount);
            });
            */
        }
    }
  };


  const handlePreference = (preference: 'like' | 'dislike') => {
    if (!currentInsight || currentInsight.isAd) return;
    currentInsight.category.forEach(cat => {
        addPreference(cat, preference);
    });
    const message = preference === 'like' ? 'Noted. We will show you more content like this.' : 'Noted. We will show you less content like this.';
    toast({ title: "Preference Saved", description: message });
    setIsPreferenceSheetOpen(false);

    window.location.reload();
  }

  const renderContent = () => {
    if (!isClient) {
      return <InsightPageLoadingSkeleton />;
    }
    if (insights.length === 0 && !isLoading) {
      return <InsightPageLoadingSkeleton />; 
    }
    return (
      <>
        {insights.map((insight, index) => (
          <div className="relative min-w-0 flex-[0_0_100%] h-full" key={`${insight.slug}-${index}`} role="group" aria-roledescription="slide" aria-label={`Insight ${index + 1} of ${insights.length}`}>
              {insight.isAd ? (
                <AdPlaceholder />
              ) : (
                <InsightView 
                  insight={insight} 
                  isActive={index === activeSlideIndex}
                  initialDeepDiveIndex={insight.slug === initialSlug ? initialDeepDiveIndex : 0}
                  startOnDeepDive={insight.slug === initialSlug ? startOnDeepDive : false}
                />
              )}
          </div>
        ))}
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

  if (!currentInsight && insights.length > 0 && isClient) {
    return null; 
  }

  const isRssPage = pathname.startsWith('/rss') || pathname.startsWith('/insight/rss');
  const currentHorizontalApi = currentInsight ? horizontalApis.current.get(currentInsight.slug) : undefined;
  
  const SaveIcon = isCurrentItemSaved ? Pencil : Bookmark;
  const saveIconClassName = isCurrentItemSaved ? 'fill-current' : '';


  return (
    <OnboardingContext.Provider
      value={{
        triggerScrollDown: scrollDown,
        triggerScrollRight: scrollRight,
        setOnboardingActive: setOnboardingActiveCallback,
        isEmblaApiReady: isEmblaApiReady,
      }}
    >
      {!hasSeenOnboarding && (
        <OnboardingFlow onComplete={markOnboardingComplete} />
      )}
      <CarouselContext.Provider value={{ setHorizontalEmblaApi, currentInsightSlug: currentInsight?.slug }}>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <PageHeader 
            rssCategories={isRssPage ? rssCategories : undefined}
            rssSelectedCategory={rssSelectedCategory}
            onRssCategoryChange={handleCategoryChange}
        />

        {returnToSlug && (
          <div className={cn("fixed top-4 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300", {
            'opacity-0 pointer-events-none': activeSlideIndex > 0, // Hide after the first scroll
           })}>
              <Button 
                onClick={handleBackToBlog} 
                variant="outline" 
                size="sm"
                aria-label="Back to Blog" 
                className="bg-background/50 backdrop-blur-sm rounded-full"
              >
                <ArrowUp className="h-4 w-4 mr-1" />
                Back to Blog
              </Button>
          </div>
        )}

        <div className="overflow-hidden h-full w-full" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Insights Carousel">
          <div className="flex flex-col h-full">
            {renderContent()}
          </div>
        </div>
        
        <div className="fixed bottom-20 right-4 z-20 flex flex-col items-center gap-2">
             <Button
              onClick={() => setIsPreferenceSheetOpen(true)}
              variant="outline"
              size="icon"
              aria-label="More options"
              className="bg-background/50 backdrop-blur-sm rounded-full"
              disabled={!currentInsight || currentInsight.isAd}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {/* New Replay Onboarding Button */}
            <Button
              onClick={() => {
                resetOnboarding();
              }}
              variant="outline"
              size="icon"
              aria-label="Replay Onboarding"
              className="bg-background/50 backdrop-blur-sm rounded-full"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <div className="relative">
                <Button
                  onClick={handleSaveClick}
                  variant="outline"
                  size="icon"
                  aria-label="Save"
                  className="bg-background/50 backdrop-blur-sm rounded-full"
                  disabled={!currentInsight || currentInsight.isAd}
                >
                  <SaveIcon className={cn("h-4 w-4", saveIconClassName)} />
                </Button>
                {/* 
                {saveCount > 0 && (
                    <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                        {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(saveCount)}
                    </span>
                )}
                */}
            </div>
            
        </div>

        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-20">
            <Button
              onClick={scrollRight}
              variant="outline"
              aria-label="Scroll Right"
              className={cn(
                "h-10 px-3 bg-background/50 backdrop-blur-sm rounded-l-[1rem] rounded-r-none text-sm font-semibold flex items-center gap-2 text-muted-foreground", // Desktop
                isMobile && "h-auto w-auto min-w-[2rem] py-4 px-1 mb-0 mt-0 text-xs flex justify-center items-center gap-1 [writing-mode:vertical-rl] rounded-tr-none rounded-tl-[1rem] rounded-br-none rounded-bl-[1rem] text-muted-foreground" // Mobile: flex items-center, rotate 270
              )}
              disabled={Boolean(!currentInsight || (currentInsight && currentInsight.isAd) || (currentHorizontalApi && !currentHorizontalApi.canScrollNext()))}
            >
              <span className={cn(isMobile && "rotate-180")}>Read More</span> <ArrowRight className="h-4 w-4" />
            </Button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center mb-16">
            <Button 
              onClick={scrollDown} 
              variant="outline" 
              size="icon" 
              aria-label="Next Insight" 
              className="min-w-[3rem] w-auto h-auto py-2 px-4 bg-background/50 mb-0 mt-0 backdrop-blur-sm rounded-t-[1rem] rounded-b-none text-sm font-semibold flex items-center gap-2 text-muted-foreground"
              
            >
              Next<ArrowDown className="h-5 w-5" />
            </Button>
        </div>

        <Sheet open={isPreferenceSheetOpen} onOpenChange={setIsPreferenceSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader>
                <SheetTitle>Customize Your Feed</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePreference('like')}>
                    <ThumbsUp />
                    <span>More like this</span>
                </Button>
                 <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePreference('dislike')}>
                    <ThumbsDown />
                    <span>Less like this</span>
                </Button>
            </div>
          </SheetContent>
        </Sheet>
        
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
    </OnboardingContext.Provider>
  );
};
