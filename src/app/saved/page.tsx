import { getPostsBySlugs } from "@/lib/posts";
import { SavedPageHeader } from "@/components/saved/saved-page-header";
import SavedPageClient from "./client";
import { cookies } from 'next/headers';
import type { SavedItem, Post } from "@/types";

async function getSavedItems(cookieStore: any): Promise<SavedItem[]> {
  const savedItemsCookie = cookieStore.get('savedItems');
  if (savedItemsCookie) {
    try {
      return JSON.parse(savedItemsCookie.value);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export default async function SavedPage() {
    const cookieStore = cookies();
    const savedItems = await getSavedItems(cookieStore);
    const postSlugs = savedItems.map(item => item.slug);
    const posts = await getPostsBySlugs(postSlugs);

    const postsWithSavedData = posts.map(post => {
        const savedItem = savedItems.find(item => item.slug === post.slug)!;
        return { ...post, savedItem };
    });

    return (
        <div className="bg-background min-h-screen">
            <SavedPageHeader title="Saved Items" />

            <main className="container mx-auto px-4 py-8 pt-24">
                <SavedPageClient initialPosts={postsWithSavedData} />
            </main>
        </div>
    );
}