'use server'

import { getPaginatedPosts as getSupabasePaginatedPosts } from '@/lib/posts'
import { Post } from '@/types'

const PAGE_SIZE = 10;

interface PaginatedPostsOptions {
  page: number;
  topic_id?: string;
}

export async function getPaginatedPosts({
    page,
    topic_id,
}: PaginatedPostsOptions): Promise<{ posts: Post[], hasMore: boolean }> {

    const { posts, hasMore } = await getSupabasePaginatedPosts({ page, topic_id });
    return { posts, hasMore };
}
