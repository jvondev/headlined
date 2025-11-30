import { CompendiaPost } from "@/types";
import { getAllPostsFromIndexedDB } from "./indexeddb";

export async function getPostsBySlugs(slugs: string[]): Promise<CompendiaPost[]> {
    const allPosts = await getAllPostsFromIndexedDB();
    // In Compendia, we use ID as slug for saved items
    return allPosts.filter(post => slugs.includes(post.id));
}
