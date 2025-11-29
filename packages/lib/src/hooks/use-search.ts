"use client";

import { useState, useEffect, useCallback } from 'react';
import { SearchIndex, createSearchIndex } from '../utils/search';
import type { Post, SearchResult, SearchableItem } from '@/types';
import { getAllPostsForSearch } from '../utils/client-posts';

let searchIndex: SearchIndex | null = null;
let searchableItemsCache: SearchableItem[] | null = null;
let isIndexing = false;
let indexingPromise: Promise<void> | null = null;

async function getSearchableData(): Promise<SearchableItem[]> {
    if (searchableItemsCache) {
        return searchableItemsCache;
    }
    const posts = await getAllPostsForSearch();
    const documents: SearchableItem[] = [];

    posts.forEach((post) => {
        // Add the main post
        documents.push({
            id: `${post.slug}-post`,
            slug: post.slug,
            type: 'post',
            title: post.title,
            content: `${post.title} ${post.description}`,
            icon: 'Info', 
        });
    });

    searchableItemsCache = documents;
    return documents;
}

async function initializeSearch() {
  if (searchIndex || isIndexing) {
    return indexingPromise;
  }

  isIndexing = true;
  indexingPromise = (async () => {
    try {
      const searchableItems = await getSearchableData();
      const newIndex = createSearchIndex();
      
      searchableItems.forEach(doc => {
        newIndex.add(doc);
      });
      
      searchIndex = newIndex;
    } catch (error) {
      console.error("Failed to initialize search index:", error);
    } finally {
      isIndexing = false;
    }
  })();
  return indexingPromise;
}


export function useSearch() {
    const [isReady, setIsReady] = useState(!!searchIndex);
    const [results, setResults] = useState<SearchResult[]>([]);
    
    useEffect(() => {
        let isMounted = true;
        
        async function init() {
            if (!searchIndex) {
                await initializeSearch();
            }
            if (isMounted) {
                setIsReady(true);
            }
        }
        
        init();

        return () => {
            isMounted = false;
        }
    }, []);

    const search = useCallback(async (query: string) => {
        if (!query.trim() || !isReady || !searchIndex || !searchableItemsCache) {
            setResults([]);
            return;
        }

        const searchResults = searchIndex.search(query, {
            // Fetch more results to allow for client-side pagination
            limit: 50,
            suggest: true,
            enrich: true, // Returns the full document
        });

        if (searchResults.length === 0) {
            setResults([]);
            return;
        }

        const uniqueResultIds = new Set<string>();
        const finalResults: SearchableItem[] = [];

        searchResults.forEach(res => {
            res.result.forEach(id => {
                const doc = searchableItemsCache?.find(item => item.id === id);
                if (doc && !uniqueResultIds.has(doc.id)) {
                    uniqueResultIds.add(doc.id);
                    finalResults.push(doc);
                }
            })
        });

        if (finalResults.length === 0) {
            setResults([]);
            return;
        }
        
        const allPosts = await getAllPostsForSearch();
        const postsMap = new Map<string, Post>(allPosts.map(i => [i.slug, i]));
        
        const enrichedResults: SearchResult[] = finalResults
            .map(item => {
                if (!item) return null;
                
                const post = postsMap.get(item.slug);
                if (!post) return null;

                return {
                    ...item,
                    topic_id: post.topic_id,
                };
            })
            .filter((r): r is SearchResult => r !== null)
            .sort((a, b) => {
                const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
                const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
                if (aTitleMatch && !bTitleMatch) return -1;
                if (!aTitleMatch && bTitleMatch) return 1;
                return 0;
            });
        
        setResults(enrichedResults);

    }, [isReady]);

    return { isReady, search, results, setResults };
}
