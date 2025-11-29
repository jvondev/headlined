'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { getPaginatedPosts } from '@repo/lib/utils/client-posts';
import { useInView } from '@repo/lib/hooks/use-in-view';
import { PostView } from './post-view';
import { PostPageLoadingSkeleton } from './post-page-loading-skeleton';

export function PostFeedClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { ref, inView } = useInView();

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setLoading(true);
      try {
        const { posts: fetchedPosts, hasMore } = await getPaginatedPosts({ page: 1 });
        setPosts(fetchedPosts);
        setHasMore(hasMore);
      } catch (error) {
        console.error('Error fetching initial posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      const fetchMorePosts = async () => {
        setLoading(true);
        try {
          const { posts: fetchedPosts, hasMore } = await getPaginatedPosts({ page: page + 1 });
          setPosts((prev) => [...prev, ...fetchedPosts]);
          setHasMore(hasMore);
        } catch (error) {
          console.error('Error fetching more posts:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMorePosts();
    }
  }, [inView, hasMore, loading, page]);

  if (loading && page === 1) {
    return <PostPageLoadingSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No posts found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostView key={post.slug} post={post} isActive={true} />
      ))}
      <div ref={ref} className="h-10" /> {/* Sentinel for infinite scroll */}
    </div>
  );
}
