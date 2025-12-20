import * as fs from 'fs';
import * as path from 'path';
import { InternalArticle, ArticleStorage } from '@/types/article';
import { CATEGORIES } from '@scraper/categories';

const ARTICLES_PATH = path.join(process.cwd(), 'src', 'data', 'internal-articles', 'articles.json');

/**
 * Read articles from JSON file
 */
export function readArticlesStorage(): ArticleStorage {
    try {
        const data = fs.readFileSync(ARTICLES_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { version: 1, articles: [] };
    }
}

/**
 * Write articles to JSON file
 */
export function writeArticlesStorage(storage: ArticleStorage): void {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(storage, null, 2), 'utf-8');
}

/**
 * Get all articles
 */
export function getAllArticles(): InternalArticle[] {
    return readArticlesStorage().articles;
}

/**
 * Get published articles only
 */
export function getPublishedArticles(): InternalArticle[] {
    return getAllArticles().filter(a => a.status === 'published');
}

/**
 * Get article by category, subcategory, and slug
 */
export function getArticleBySlug(
    category: string,
    subcategory: string,
    slug: string
): InternalArticle | undefined {
    return getAllArticles().find(
        a => a.category === category && a.subcategory === subcategory && a.slug === slug
    );
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string): InternalArticle[] {
    return getAllArticles().filter(a => a.category === category);
}

/**
 * Save or update an article
 */
export function saveArticle(article: InternalArticle): InternalArticle {
    const storage = readArticlesStorage();
    const existingIndex = storage.articles.findIndex(a => a.id === article.id);

    const now = new Date().toISOString();
    article.updatedAt = now;

    if (existingIndex >= 0) {
        storage.articles[existingIndex] = article;
    } else {
        article.createdAt = now;
        storage.articles.push(article);
    }

    writeArticlesStorage(storage);
    return article;
}

/**
 * Delete an article by ID
 */
export function deleteArticle(id: string): boolean {
    const storage = readArticlesStorage();
    const initialLength = storage.articles.length;
    storage.articles = storage.articles.filter(a => a.id !== id);

    if (storage.articles.length < initialLength) {
        writeArticlesStorage(storage);
        return true;
    }
    return false;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all categories with their subcategories
 */
export function getCategories() {
    return CATEGORIES.map(cat => ({
        id: cat.id,
        label: cat.label,
        subcategories: cat.items.map(item => ({
            slug: item.slug,
            title: item.title
        }))
    }));
}

