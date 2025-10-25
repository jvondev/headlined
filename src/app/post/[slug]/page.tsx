import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { serverSupabase } from "@/lib/server-supabase";
import { PostPageClient } from './client';
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getPaginatedPosts } from "@/lib/actions";
import { cookies } from "next/headers";
import { Suspense } from 'react';
import { PostPageLoadingSkeleton } from '@/components/post-page-loading-skeleton';

type PostPageProps = {
    params: {
        slug: string;
    },
    searchParams: { [key: string]: string | string[] | undefined }
}

export const revalidate = 86400; // Revalidate every day

export async function generateStaticParams() {
  const { data: posts } = await serverSupabase
    .from('posts')
    .select('slug')
    .order('created_at', { ascending: false })
    .limit(10); // Limit to 10 most recent posts for static generation

  return (posts || []).map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

function getDynamicParams(params: { slug: string }, searchParams: { [key: string]: string | string[] | undefined }) {
  return {
    slug: params.slug,
    topic_id: searchParams?.topic_id as string | undefined,
  };
}

export async function generateMetadata({ params, searchParams }: PostPageProps): Promise<Metadata> {
  const { slug } = getDynamicParams(params, searchParams);
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default function PostPage({ params, searchParams }: PostPageProps) {
  return (
    <Suspense fallback={<PostPageLoadingSkeleton />}>
      <PostPageWithData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PostPageWithData({ params, searchParams }: PostPageProps) {
  const { slug, topic_id } = getDynamicParams(params, searchParams);
  
  const { posts, hasMore } = await getPaginatedPosts({ page: 1, topic_id });
  const currentPost = posts.find(i => i.slug === slug);

  // If the slug is not on the first page (e.g. from a direct link), fetch it directly
  // and prepend it to the list to ensure it's available for the carousel.
  if (!currentPost) {
    const post = await getPostBySlug(slug);
    if (!post) {
      notFound();
    }
    // Prepend the post to the list. The carousel will start at this post.
    posts.unshift(post);
  }
  
  return (
    <PostPageClient 
      initialPosts={posts} 
      slug={slug} 
      initialHasMore={hasMore}
    />
  );
}