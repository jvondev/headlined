import { CATEGORIES, CategoryDefinition } from './categories';

export interface ClassificationResult {
    category: string;
    slug: string;
    score: number;
}

export class Classifier {
    private categories: CategoryDefinition[];

    constructor() {
        this.categories = CATEGORIES;
    }

    public classify(title: string, description: string | null): ClassificationResult[] {
        const text = `${title} ${description || ''}`.toLowerCase();
        const results: ClassificationResult[] = [];
        const uniqueMatches = new Set<string>();

        // 1. Direct Keyword Matching
        for (const cat of this.categories) {
            for (const keyword of cat.keywords) {
                const lowerKeyword = keyword.toLowerCase();
                // Simple word boundary check to avoid substrings (e.g., "win" inside "winter")
                // We escape special regex characters in the keyword
                const escapedKeyword = lowerKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

                if (regex.test(text)) {
                    // Create a slug from the keyword
                    const slug = this.slugify(keyword);
                    const key = `${cat.id}:${slug}`;

                    if (!uniqueMatches.has(key)) {
                        uniqueMatches.add(key);
                        results.push({
                            category: cat.id,
                            slug: slug,
                            score: 1 // Basic score, could be higher for title matches
                        });
                    }
                }
            }

            // 2. Pattern Matching (if any)
            if (cat.patterns) {
                for (const pattern of cat.patterns) {
                    if (pattern.test(text)) {
                        // Note: Patterns need a way to determine the slug. 
                        // For now, we assume patterns are specific to the category generic bucket 
                        // or we need named groups. To keep it simple, we skip complex pattern-to-slug mapping
                        // unless we define specific pattern-slug pairs.
                        // For this iteration, we rely on keywords.
                    }
                }
            }
        }

        return results;
    }

    private slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-');  // Replace multiple - with single -
    }
}
