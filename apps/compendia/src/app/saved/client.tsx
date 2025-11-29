
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSavedItems } from "@repo/lib/hooks/use-saved-items";
import { Button } from "@repo/ui/components/ui/button";
import { X, BookmarkX, Shuffle, Download } from "lucide-react";
import type { Post, SavedItem } from "@repo/lib/types";
import { SavedItemPreviewCard } from "@/components/saved-item-preview";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@repo/ui/components/ui/alert-dialog";
import { useInterval } from "react-use";
import { SavedItemsFilter } from "@/components/saved-items-filter";

type FilterType = "all" | "saved" | "note";

export default function SavedPageClient({ initialPosts }: { initialPosts: (Post & { savedItem: SavedItem })[] }) {
    const { savedItems, removeSavedItem, isLoaded } = useSavedItems();
    const [filter, setFilter] = useState<FilterType>("all");

    // Shuffle state
    const [isShuffling, setIsShuffling] = useState(false);
    const [shuffledItem, setShuffledItem] = useState<SavedItem | null>(null);
    const [shuffleAnimationItem, setShuffleAnimationItem] = useState<SavedItem | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const postsMap = useMemo(() => {
        const map = new Map<string, Post>();
        initialPosts.forEach(post => map.set(post.slug, post));
        return map;
    }, [initialPosts]);

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

        let href = `/post/${item.slug}`;

        href += `?from=saved`;

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
        linkElement.download = 'ReadMore_saved_items.md';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);
    };

    if (!isLoaded) {
        return null;
    }

    const handleRemove = (id: string) => {
        // Prevent the link from firing
        event?.preventDefault();
        event?.stopPropagation();
        removeSavedItem(id);
    }

    const renderContent = () => {
        if (savedItems.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <BookmarkX className="size-16 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-bold font-headline">No Saved Items</h2>
                    <p className="mt-2 text-muted-foreground">
                        You haven't saved any posts yet. Look for the bookmark icon to save content for later.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 grid-flow-dense">
                {filteredItems.map(item => {
                    const post = postsMap.get(item.slug);
                    const hasNote = item.note && item.note.trim().length > 0;

                    if (!post) return null;

                    return (
                        <div key={item.id} className={hasNote ? "col-span-2 group relative" : "group relative"}>
                            <Link href={getLinkHref(item)} className="block w-full h-full">
                                <SavedItemPreviewCard
                                    item={item}
                                    post={post}
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
        <>
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
                            {isAnimating ? 'Shuffling...' : 'Your random post is...'}
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
                                    post={postsMap.get(shuffleAnimationItem.slug)!}
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
        </>
    );
}
