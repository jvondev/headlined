import FlexSearch from 'flexsearch';

export type SearchIndex = any;

export function createSearchIndex(): SearchIndex {
    return new FlexSearch.Document({
        document: {
            id: 'id',
            index: ['title', 'content'],
            store: ['title', 'slug', 'type', 'icon']
        },
        tokenize: 'forward'
    });
}
