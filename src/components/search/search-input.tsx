"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, ArrowRight, Rss, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { topicsData } from '@/data/topics-data';
import { interestsData } from '@/data/interests-data';
import { subscribeToFeed, unsubscribeFromFeed, getSubscribedInterests } from '@/lib/local-storage';
import { useToast } from '@/hooks/use-toast';

interface SearchInputProps {
    initialQuery?: string;
    onSearch: (query: string, filters: { type: 'all' | 'topic' | 'interest'; value?: string }) => void;
    autoFocus?: boolean;
    className?: string;
    isPremium?: boolean;
    onPremiumRequest?: () => void;
}

export function SearchInput({ initialQuery = '', onSearch, autoFocus = false, className, isPremium = false, onPremiumRequest }: SearchInputProps) {
    const [query, setQuery] = useState(initialQuery);
    const [isExpanded, setIsExpanded] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'topic' | 'interest'>('all');
    const [filterValue, setFilterValue] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    // Check if current query is already subscribed
    useEffect(() => {
        if (!query) {
            setIsSubscribed(false);
            return;
        }
        const subscribed = getSubscribedInterests();
        setIsSubscribed(subscribed.some(i => i.name.toLowerCase() === query.toLowerCase()));
    }, [query]);

    const handleSearch = () => {
        onSearch(query, { type: filterType, value: filterValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setQuery('');
        setFilterType('all');
        setFilterValue(undefined);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleSubscribe = () => {
        if (!query) return;

        if (!isPremium) {
            onPremiumRequest?.();
            return;
        }

        if (isSubscribed) {
            unsubscribeFromFeed(query, 'interest');
            setIsSubscribed(false);
            toast({ title: "Unsubscribed", description: `Removed "${query}" from your interests.` });
        } else {
            subscribeToFeed({ name: query, aliases: [], icon: 'Search' }, 'interest');
            setIsSubscribed(true);
            toast({ title: "Subscribed!", description: `Added "${query}" to your interests.` });
        }
        // Dispatch event to update UI immediately
        window.dispatchEvent(new Event('feedChange'));
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <>
            <div className={cn("w-full max-w-2xl mx-auto relative z-50", className)}>
                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search posts, topics, or interests..."
                            className="pl-12 pr-32 h-14 text-lg rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {query && (
                                <Button variant="ghost" size="icon" onClick={clearSearch} className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground">
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant={filterType !== 'all' ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={cn("h-9 w-9 rounded-xl transition-all", filterType !== 'all' && "bg-primary text-primary-foreground")}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                onClick={handleSearch}
                                className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Subscribe Button (Beside Search Bar) */}
                {query && (
                    <div className="shrink-0">
                        <Button
                            size="lg"
                            variant={isSubscribed ? "default" : "outline"}
                            onClick={handleSubscribe}
                            className={cn(
                                "h-14 px-6 rounded-2xl transition-all border-2 flex items-center gap-2 shadow-sm hover:shadow-md",
                                !isPremium && "opacity-90 border-dashed border-primary/30 hover:border-primary/60 bg-secondary/30"
                            )}
                            title={isPremium ? "Subscribe to this search" : "Premium: Subscribe to this search"}
                        >
                            {isPremium ? (
                                <>
                                    <Rss className={cn("w-5 h-5", isSubscribed && "fill-current")} />
                                    <span className="font-bold">{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Rss className="w-5 h-5 opacity-50" />
                                        <div className="absolute -top-1.5 -right-1.5 bg-background rounded-full p-0.5 shadow-sm border border-border">
                                            <Lock className="w-2.5 h-2.5 text-primary" />
                                        </div>
                                    </div>
                                    <span className="font-medium text-muted-foreground">Subscribe</span>
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 p-4 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Filter by Type</h4>
                                <div className="flex gap-2">
                                    <Badge
                                        variant={filterType === 'all' ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1.5"
                                        onClick={() => { setFilterType('all'); setFilterValue(undefined); }}
                                    >
                                        All
                                    </Badge>
                                    <Badge
                                        variant={filterType === 'topic' ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1.5"
                                        onClick={() => { setFilterType('topic'); setFilterValue(undefined); }}
                                    >
                                        Topics
                                    </Badge>
                                    <Badge
                                        variant={filterType === 'interest' ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1.5"
                                        onClick={() => { setFilterType('interest'); setFilterValue(undefined); }}
                                    >
                                        Interests
                                    </Badge>
                                </div>
                            </div>

                            {filterType === 'topic' && (
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Topic</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {topicsData.map(topic => (
                                            <Badge
                                                key={topic.name}
                                                variant={filterValue === topic.name ? "secondary" : "outline"}
                                                className={cn("cursor-pointer hover:bg-secondary/50", filterValue === topic.name && "bg-primary/20 text-primary border-primary/20")}
                                                onClick={() => setFilterValue(topic.name)}
                                            >
                                                {topic.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filterType === 'interest' && (
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Interest</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {interestsData.map(interest => (
                                            <Badge
                                                key={interest.name}
                                                variant={filterValue === interest.name ? "secondary" : "outline"}
                                                className={cn("cursor-pointer hover:bg-secondary/50", filterValue === interest.name && "bg-primary/20 text-primary border-primary/20")}
                                                onClick={() => setFilterValue(interest.name)}
                                            >
                                                {interest.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button className="w-full rounded-xl" onClick={() => { setIsExpanded(false); handleSearch(); }}>
                                Apply Filters
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
