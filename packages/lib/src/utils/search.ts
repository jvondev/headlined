
import { Document } from 'flexsearch';
import type { SearchableItem } from '../types';

// This defines the structure of the search index document.
// We are telling FlexSearch that each document has an `id` and `content` field.
export type SearchDocument = SearchableItem;

// The type for our search index.
// The `true` parameter enables the storage of documents, which can be useful.
export type SearchIndex = Document<SearchDocument, true>;

// This function creates a new search index with a specific configuration.
export function createSearchIndex(): SearchIndex {
    return new Document({
        document: {
            id: 'id',
            index: ['title', 'content'], // We want to search within title and content.
            store: true, // We need to store the document to enrich results.
        },
        tokenize: 'forward' // "forward" is a good balance for substring matching.
    });
}
