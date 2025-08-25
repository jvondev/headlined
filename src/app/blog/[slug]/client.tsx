
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Insight, SavedItem } from "@/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ArticleContentLoadingSkeleton, ArticleContent } from "./article-content";
import { useSavedItems } from "@/hooks/use-saved-items";
import { getInsightBySlug } from "@/lib/insights";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bookmark, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { SaveDialog } from "@/components/save-dialog";

const BlogFooter = ({ onVisible }: { onVisible: () => void }) => {
    const { ref, inView } = useInView({ threshold: 0.1 }); 
    
    useEffect(() => {
        if (inView) {
            onVisible();
        }
    }, [inView, onVisible]);

    return (
        <footer className="mt-16 border-t flex flex-col items-center justify-between text-center min-h-[120vh]">
            <div className="container mx-auto px-4 text-muted-foreground pt-20">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Next Up</h3>
                <p className="mt-2 max-w-md text-lg mx-auto">
                    Scroll up to close and see more insights.
                </p>
            </div>
            {/* The ref is now on an invisible div at the very bottom, pushed down by the container above */}
            <div ref={ref} className="h-20 w-full" /> 
        </footer>
    );
};


export function BlogPageClient({ 
  initialInsight, 
  slug,
}: { 
  initialInsight?: Insight, 
  slug: string,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSaved = searchParams.get('from') === 'saved';

  const [isOpen, setIsOpen] = useState(true);
  const [insight, setInsight] = useState<Insight | undefined>(initialInsight);
  const [shouldAnimate, setShouldAnimate] = useState(!initialInsight);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const { toast } = useToast();
  const savedItemId = `${slug}-blog`;
  const { isSaved, addSavedItem, removeSavedItem, getSavedItem } = useSavedItems();
  const isCurrentlySaved = isSaved(savedItemId);
  const currentSavedItem = getSavedItem(savedItemId);

  useEffect(() => {
    if (initialInsight) {
        setInsight(initialInsight);
        setShouldAnimate(false);
        return;
    }

    setInsight(undefined);
    setShouldAnimate(true);
    let isCancelled = false;
      
    const fetchInsight = async () => {
        try {
            let fetchedInsight: Insight | undefined;
            // If coming from saved page, try to get data from the saved item first
            if (fromSaved) {
                const savedItem = getSavedItem(savedItemId);
                if (savedItem?.insightData) {
                    fetchedInsight = savedItem.insightData;
                }
            }
            // Fallback to fetching if not found in saved data or not from saved page
            if (!fetchedInsight) {
                fetchedInsight = await getInsightBySlug(slug);
            }
            
            if (!isCancelled) {
                setInsight(fetchedInsight);
            }
        } catch (error) {
            console.error("Failed to fetch insight:", error);
        }
    };
    fetchInsight();
    return () => {
        isCancelled = true;
    };
  }, [slug, initialInsight, fromSaved, getSavedItem, savedItemId]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false);
      // Delay navigation to allow the modal's closing animation to complete.
      setTimeout(() => {
        if (insight) {
            const isRss = insight.slug.startsWith('rss-');
            if (isRss) {
                router.push(`/insight/rss/${insight.slug.replace('rss-', '')}?action=next`);
            } else {
                router.push(`/insight/${insight.slug}?action=next`);
            }
        } else {
             router.back();
        }
      }, 300);
    }
  }, [insight, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOpenChange]);

  const itemToSave = useMemo(() => {
    if (!insight) return null;
    return {
      id: savedItemId,
      slug: insight.slug,
      title: `${insight.title} (Full Story)`,
      type: 'blog',
      insightData: insight, // Always include the full insight data
    } as Omit<SavedItem, 'savedAt' | 'note'>;
  }, [insight, savedItemId]);

  const handleSaveClick = () => {
    if (!itemToSave) return;
    if (isCurrentlySaved) {
      setIsSaveDialogOpen(true);
    } else {
      addSavedItem(itemToSave);
      toast({ title: "Saved!", description: "Added to your saved items." });
    }
  };

  const handleSaveWithNote = (item: Omit<SavedItem, 'savedAt'>) => {
    addSavedItem(item);
    toast({ title: "Saved!", description: "Your item and note have been saved." });
  };

  const handleRemoveFromSaved = (id: string) => {
    removeSavedItem(id);
    toast({ title: "Removed", description: "Removed from your saved items." });
  };

  const SaveIcon = isCurrentlySaved ? Pencil : Bookmark;
  const saveIconClassName = isCurrentlySaved ? 'fill-current text-primary' : '';

  return (
    <div className="bg-background min-h-screen">
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
            side={'right'}
            className={cn(
                "p-0 w-full h-full flex flex-col bg-background sm:max-w-full",
                !shouldAnimate && 'animate-in-none'
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
            <SheetHeader className="p-2 border-b bg-background sticky top-0 z-10 flex flex-row items-center justify-between shrink-0">
                 <SheetTitle className="sr-only">
                    {insight ? `Full Story: ${insight.title}` : 'Loading Full Story...'}
                </SheetTitle>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenChange(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </Button>
                <div className="flex-1 min-w-0 px-2">
                    <p className="text-sm font-medium truncate" title={insight?.title || 'Loading...'}>
                        {insight ? insight.title : 'Loading...'}
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveClick} disabled={!insight}>
                    <SaveIcon className={`h-5 w-5 ${saveIconClassName}`} />
                    <span className="sr-only">Save</span>
                </Button>
            </SheetHeader>
            
            <div className="flex-1 relative overflow-hidden">
                {!insight ? (
                    <div className="absolute inset-0">
                        <ArticleContentLoadingSkeleton />
                    </div>
                ) : (
                     <div className="absolute inset-0">
                        <ScrollArea className="h-full touch-pan-y">
                           <main className="container mx-auto px-4 py-8">
                                <ArticleContent insight={insight} />
                           </main>
                           <BlogFooter onVisible={() => handleOpenChange(false)} />
                        </ScrollArea>
                    </div>
                )}
                 {!insight && shouldAnimate === false && (
                    <div className="flex items-center justify-center h-full text-center">
                        <p className="text-muted-foreground">Could not load article.</p>
                    </div>
                 )}
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
  );
}
