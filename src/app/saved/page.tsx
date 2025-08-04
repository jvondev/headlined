
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSavedItems } from "@/hooks/use-saved-items";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { X, BookmarkX, Shuffle, Download } from "lucide-react";
import type { Insight, SavedItem } from "@/types";
import { getInsightBySlug } from "@/lib/insights";
import { SavedItemPreviewCard } from "@/components/saved-item-preview";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useInterval } from "react-use";
import { SavedItemsFilter } from "@/components/saved-items-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

type FilterType = "all" | "saved" | "note";

// A dummy insight to show while the client-side fetches real data
const createDummyInsight = (item: SavedItem): Insight => ({
    slug: item.slug,
    title: item.title,
    headline: 'Loading...',
    summary: 'Fetching saved content...',
    category: ['...'],
    blogContent: '',
    deepDives: [],
    seo: { title: item.title, description: '' }
});

const SavedItemPreviewSkeleton = ({ hasNote }: { hasNote: boolean }) => (
    <div className={hasNote ? "col-span-2" : ""}>
        <Card className="w-full h-full flex flex-col bg-card border shadow-md overflow-hidden">
            <div className="flex-shrink-0 text-center py-1 border-b">
                 <Skeleton className="h-4 w-1/4 mx-auto" />
            </div>
            <div className={`flex-grow relative w-full bg-background/50 rounded-b-md overflow-hidden flex ${hasNote ? "flex-col md:flex-row" : ""}`}>
                <div className={`relative flex items-center justify-center ${hasNote ? "w-full md:w-1/2" : "w-full"}`}>
                    <div className="w-full aspect-square p-4 flex flex-col items-center justify-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                {hasNote && (
                    <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l p-4 space-y-2 min-h-[120px]">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
            </div>
        </Card>
    </div>
);


export default function SavedPage() {
    const { savedItems, removeSavedItem, isLoaded } = useSavedItems();
    const [isLoading, setIsLoading] = useState(true);
    const [insightsMap, setInsightsMap] = useState<Map<string, Insight>>(new Map());
    const [filter, setFilter] = useState<FilterType>("all");
    
    // Shuffle state
    const [isShuffling, setIsShuffling] = useState(false);
    const [shuffledItem, setShuffledItem] = useState<SavedItem | null>(null);
    const [shuffleAnimationItem, setShuffleAnimationItem] = useState<SavedItem | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (!isLoaded) return;

      const fetchInsights = async () => {
          setIsLoading(true);
          const newMap = new Map<string, Insight>();

          const itemsToFetch: SavedItem[] = [];
          savedItems.forEach(item => {
              // Prioritize using the fully-cached insightData if it exists
              if (item.insightData) {
                  newMap.set(item.slug, item.insightData);
              } else {
                  itemsToFetch.push(item);
              }
          });
          
          setInsightsMap(new Map(newMap));

          if (itemsToFetch.length > 0) {
              const uniqueSlugsToFetch = [...new Set(itemsToFetch.map(item => item.slug))];
              const insightPromises = uniqueSlugsToFetch.map(slug => getInsightBySlug(slug));
              const fetchedInsights = await Promise.all(insightPromises);

              fetchedInsights.forEach(insight => {
                  if (insight) {
                      newMap.set(insight.slug, insight);
                  }
              });
              setInsightsMap(new Map(newMap));
          }
          setIsLoading(false);
      };

      if (savedItems.length > 0) {
          fetchInsights();
      } else {
          setIsLoading(false);
      }

    }, [savedItems, isLoaded]);

    const filteredItems = useMemo(() => {
        if (filter === "saved") {
            return savedItems.filter(item => !item.note || item.note.trim().length === 0);
        }
        if (filter === "note") {
            return savedItems.filter(item => item.note && item.note.trim().length > 0);
        }
        return savedItems;
    }, [savedItems, filter]);

    // Shuffle Animation Interval
    useInterval(
        () => {
            if (filteredItems.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredItems.length);
                setShuffleAnimationItem(filteredItems[randomIndex]);
            }
        },
        isAnimating ? 100 : null // Run every 100ms when animating
    );
    
    const handleShuffleClick = () => {
        if (filteredItems.length < 1) return;
        
        setIsShuffling(true);
        setIsAnimating(true);
        setShuffledItem(null);
        setShuffleAnimationItem(filteredItems[0]);

        // "Slot machine" stops after 1.5 seconds
        setTimeout(() => {
            setIsAnimating(false);
            const finalRandomIndex = Math.floor(Math.random() * filteredItems.length);
            const finalItem = filteredItems[finalRandomIndex];
            setShuffledItem(finalItem);
            setShuffleAnimationItem(finalItem); // Set animation to final item
        }, 1500); 
    };

    const closeShuffleDialog = () => {
        setIsShuffling(false);
        setIsAnimating(false);
        // Delay resetting item to allow dialog close animation
        setTimeout(() => {
            setShuffledItem(null);
            setShuffleAnimationItem(null);
        }, 300);
    };

    const getLinkHref = (item: SavedItem | null): string => {
        if (!item) return '#';
        const isRss = item.slug.startsWith('rss-');
        
        let href = item.type === 'blog'
            ? `/blog/${isRss ? 'rss/' : ''}${item.slug.replace(/^rss-/, '')}`
            : `/insight/${isRss ? 'rss/' : ''}${item.slug.replace(/^rss-/, '')}`;
            
        href += `?from=saved`;
        
        if (item.deepDiveIndex !== undefined && item.deepDiveIndex > -1) {
            href += `&deepDive=${item.deepDiveIndex}`;
        }
        
        return href;
    }
    
    const handleExport = () => {
        if (!savedItems.length) return;

        const markdownContent = savedItems
            .map(item => {
                const link = `${window.location.origin}${getLinkHref(item)}`;
                const itemType = item.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                let noteSection = '';
                if (item.note && item.note.trim().length > 0) {
                    noteSection = `
**Your Note:**
${item.note.trim()}`;
                }

                return `
---

### ${item.title}

- **Type**: ${itemType}
- **Saved on**: ${new Date(item.savedAt).toLocaleString()}
- **Link**: [${link}](${link})${noteSection}
`;
            })
            .join('');

        const blob = new Blob([markdownContent.trim()], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = 'insightscroll_saved_items.md';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);
    };


    if (!isLoaded) {
        return (
            <div className="bg-background min-h-screen">
                <PageHeader />
            </div>
        );
    }

    const handleRemove = (id: string) => {
      // Prevent the link from firing
      event?.preventDefault();
      event?.stopPropagation();
      removeSavedItem(id);
    }
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 grid-flow-dense">
                    {savedItems.map(item => (
                        <SavedItemPreviewSkeleton key={item.id} hasNote={!!item.note} />
                    ))}
                </div>
            );
        }

        if (savedItems.length === 0) {
            return (
                 <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <BookmarkX className="size-16 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-bold font-headline">No Saved Items</h2>
                    <p className="mt-2 text-muted-foreground">
                        You haven't saved any insights yet. Look for the bookmark icon to save content for later.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 grid-flow-dense">
                {filteredItems.map(item => {
                    const insight = insightsMap.get(item.slug) || createDummyInsight(item);
                    const hasNote = item.note && item.note.trim().length > 0;
                    
                    return (
                       <div key={item.id} className={hasNote ? "col-span-2 group relative" : "group relative"}>
                            <Link href={getLinkHref(item)} className="block w-full h-full">
                                <SavedItemPreviewCard
                                    item={item}
                                    insight={insight}
                                />
                            </Link>
                             <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 z-20 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(item.id)}
                            >
                                <X className="size-4" />
                                <span className="sr-only">Remove</span>
                            </Button>
                       </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-background min-h-screen">
            <PageHeader title="Saved Items" />

            <main className="container mx-auto px-4 py-8 pt-24">
                {savedItems.length > 0 && (
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <SavedItemsFilter currentFilter={filter} onFilterChange={setFilter} />
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2" />
                            Export Notes
                        </Button>
                    </div>
                )}
                
                {renderContent()}

            </main>

            {filteredItems.length > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <Button 
                        onClick={handleShuffleClick}
                        variant="outline" 
                        size="icon" 
                        aria-label="Shuffle Saved Item" 
                        className="bg-background/50 backdrop-blur-sm rounded-full"
                    >
                        <Shuffle />
                    </Button>
                </div>
            )}
            
            <AlertDialog open={isShuffling} onOpenChange={setIsShuffling}>
                <AlertDialogContent className="max-w-md w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                           {isAnimating ? 'Shuffling...' : 'Your random insight is...'}
                        </AlertDialogTitle>
                        {isAnimating && (
                             <AlertDialogDescription>
                                Finding a great piece of content for you to revisit.
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    
                    <div className="flex items-center justify-center my-4">
                       {shuffleAnimationItem && (
                           <div className="w-full max-w-[300px]">
                                <SavedItemPreviewCard 
                                    item={shuffleAnimationItem}
                                    insight={insightsMap.get(shuffleAnimationItem.slug) || createDummyInsight(shuffleAnimationItem)}
                                />
                           </div>
                       )}
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeShuffleDialog}>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild disabled={!shuffledItem}>
                            <Link href={getLinkHref(shuffledItem)}>View Now</Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
