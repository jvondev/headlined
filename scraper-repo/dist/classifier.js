"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Classifier = void 0;
const categories_1 = require("./categories");
class Classifier {
    constructor() {
        this.categories = categories_1.CATEGORIES;
    }
    classify(title, description) {
        const text = `${title} ${description || ''}`.toLowerCase();
        const results = [];
        const uniqueMatches = new Set();
        // 1. Direct Keyword Matching with Aliases
        for (const cat of this.categories) {
            // New structure: iterate items
            if (!cat.items)
                continue;
            for (const item of cat.items) {
                for (const alias of item.aliases) {
                    const lowerAlias = alias.toLowerCase();
                    // Escape special regex characters
                    const escapedAlias = lowerAlias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    // Word boundary check
                    const regex = new RegExp(`\\b${escapedAlias}\\b`, 'i');
                    if (regex.test(text)) {
                        const key = `${cat.id}:${item.slug}`;
                        if (!uniqueMatches.has(key)) {
                            uniqueMatches.add(key);
                            results.push({
                                category: cat.id,
                                slug: item.slug, // Use standard slug from config, not input text
                                score: 1 // Basic score
                            });
                        }
                        // If we matched an alias for this item, no need to check other aliases for the SAME item
                        break;
                    }
                }
            }
            // 2. Pattern Matching (if any)
            if (cat.patterns) {
                for (const pattern of cat.patterns) {
                    if (pattern.test(text)) {
                        // Pattern matching logic would go here
                        // For now we rely on explicit item aliases
                    }
                }
            }
        }
        return results;
    }
}
exports.Classifier = Classifier;
