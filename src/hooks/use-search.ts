
"use client";

import { useState, useEffect, useCallback } from 'react';
import { SearchIndex, createSearchIndex } from '@/lib/search';
import type { Insight, SearchResult, SearchableItem, DeepDive, DeepDiveType, DeepDiveContent } from '@/types';
import { getAllInsightsForSearch } from '@/lib/client-insights';

let searchIndex: SearchIndex | null = null;
let searchableItemsCache: SearchableItem[] | null = null;
let isIndexing = false;
let indexingPromise: Promise<void> | null = null;


// Helper to get content from a deep dive for indexing
function getDeepDiveContentAsString(deepDive: DeepDive<DeepDiveType>): string {
    const { title, content } = deepDive;
    let contentString = title;

    try {
        switch (deepDive.type) {
            case 'qna':
                contentString += ' ' + (content as DeepDiveContent['qna']).questions.map(q => `${q.q} ${q.a}`).join(' ');
                break;
            case 'checklist':
                contentString += ' ' + (content as DeepDiveContent['checklist']).items.map(item => item.text).join(' ');
                break;
            case 'comparison':
                const compContent = content as DeepDiveContent['comparison'];
                contentString += ` ${compContent.titleA} ${compContent.titleB} ` + compContent.items.map(item => `${item.feature} ${item.itemA} ${item.itemB}`).join(' ');
                break;
            case 'howto':
                contentString += ' ' + (content as DeepDiveContent['howto']).steps.map(step => `${step.title} ${step.description}`).join(' ');
                break;
            case 'data':
                contentString += ' ' + (content as DeepDiveContent['data']).points.map(p => `${p.value} ${p.label}`).join(' ');
                break;
            case 'alternatives':
                contentString += ' ' + (content as DeepDiveContent['alternatives']).points.map(alt => `${alt.name} ${alt.description}`).join(' ');
                break;
            case 'metadata':
                contentString += ' ' + (content as DeepDiveContent['metadata']).items.map(item => `${item.label} ${item.value}`).join(' ');
                break;
            case 'quote':
                 contentString += ` ${(content as DeepDiveContent['quote']).text} ${(content as DeepDiveContent['quote']).author}`;
                 break;
            case 'case-study':
                const csContent = content as DeepDiveContent['case-study'];
                contentString += ` ${csContent.problem} ${csContent.solution} ${csContent.result}`;
                break;
            case 'myth':
                const mythContent = content as DeepDiveContent['myth'];
                contentString += ` ${mythContent.myth} ${mythContent.fact}`;
                break;
            default:
                if (typeof content === 'object' && content !== null) {
                    contentString += ' ' + Object.values(content).join(' ');
                }
                break;
        }
    } catch (e) {
        console.error("Failed to stringify deep dive content for search", e);
    }
    return contentString;
}


async function getSearchableData(): Promise<SearchableItem[]> {
    if (searchableItemsCache) {
        return searchableItemsCache;
    }
    const insights = await getAllInsightsForSearch();
    const documents: SearchableItem[] = [];

    insights.forEach((insight) => {
        // Add the main insight summary
        documents.push({
            id: `${insight.slug}-insight`,
            slug: insight.slug,
            type: 'insight',
            title: insight.title,
            content: `${insight.title} ${insight.description}`,
            icon: 'Info', 
        });

        // Add the full blog content
        documents.push({
            id: `${insight.slug}-blog`,
            slug: insight.slug,
            type: 'blog',
            title: `${insight.title} (Full Story)`,
            content: insight.blogContent,
            icon: 'BookText', 
        });

        // Add each deep dive as a separate document
        insight.deepDives.forEach((deepDive, deepDiveIndex) => {
            documents.push({
                id: `${insight.slug}-dd-${deepDiveIndex}`,
                slug: insight.slug,
                type: deepDive.type,
                title: deepDive.title,
                content: getDeepDiveContentAsString(deepDive),
                deepDiveIndex,
                icon: deepDive.icon,
            });
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
        
        const allInsights = await getAllInsightsForSearch();
        const insightsMap = new Map<string, Insight>(allInsights.map(i => [i.slug, i]));
        
        const enrichedResults: SearchResult[] = finalResults
            .map(item => {
                if (!item) return null;
                
                const insight = insightsMap.get(item.slug);
                if (!insight) return null;

                return {
                    ...item,
                    category: insight.category[0] || '',
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
